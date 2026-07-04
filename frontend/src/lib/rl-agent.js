import { prisma } from "./prisma";
import { redis } from "./redis";

const ACTIONS = ["BUY", "SELL", "HOLD"];
const STATE_FEATURES = 8;
const MODEL_CACHE_PREFIX = "rl:model:";
const PREDICTION_CACHE_PREFIX = "rl:prediction:";

export class RLAgent {
  constructor(userId, agentName = "default") {
    this.userId = userId;
    this.agentName = agentName;
    this.learningRate = 0.01;
    this.discountFactor = 0.95;
    this.explorationRate = 0.1;
    this.minExplorationRate = 0.01;
    this.explorationDecay = 0.995;
    this.weights = null;
    this.episodeCount = 0;
    this.totalReward = 0;
    this.lastReward = 0;
    this.agentId = null;
  }

  async initialize() {
    let config = await prisma.agentConfig.findFirst({
      where: { userId: this.userId, name: this.agentName },
    });

    if (config) {
      this.agentId = config.id;
      const state = config.modelState || {};
      this.weights = state.weights || this._initWeights();
      this.learningRate = state.learningRate ?? this.learningRate;
      this.discountFactor = state.discountFactor ?? this.discountFactor;
      this.explorationRate = state.explorationRate ?? this.explorationRate;
      this.episodeCount = state.episodeCount ?? 0;
      this.totalReward = state.totalReward ?? 0;
    } else {
      this.weights = this._initWeights();
      config = await prisma.agentConfig.create({
        data: {
          userId: this.userId,
          name: this.agentName,
          modelState: this._getState(),
          hyperParams: {
            learningRate: this.learningRate,
            discountFactor: this.discountFactor,
            explorationRate: this.explorationRate,
          },
        },
      });
      this.agentId = config.id;
    }
  }

  _initWeights() {
    const fanIn = STATE_FEATURES;
    const scale = Math.sqrt(2.0 / fanIn);
    return Array.from({ length: ACTIONS.length * STATE_FEATURES }, () =>
      (Math.random() * 2 - 1) * scale
    );
  }

  _getState() {
    return {
      weights: this.weights,
      learningRate: this.learningRate,
      discountFactor: this.discountFactor,
      explorationRate: this.explorationRate,
      episodeCount: this.episodeCount,
      totalReward: this.totalReward,
      lastReward: this.lastReward,
    };
  }

  _extractFeatures(marketData) {
    if (!marketData) return new Array(STATE_FEATURES).fill(0);
    return [
      marketData.price / 10000,
      marketData.volume / 1000000,
      marketData.change24h / 100,
      marketData.high24h / 10000,
      marketData.low24h / 10000,
      (marketData.bid || marketData.price) / 10000,
      (marketData.ask || marketData.price) / 10000,
      (marketData.spread || 0) / 100,
    ];
  }

  _predict(features) {
    const qValues = new Array(ACTIONS.length).fill(0);
    for (let a = 0; a < ACTIONS.length; a++) {
      for (let f = 0; f < STATE_FEATURES; f++) {
        qValues[a] += this.weights[a * STATE_FEATURES + f] * features[f];
      }
    }
    return qValues;
  }

  _softmax(qValues) {
    const maxQ = Math.max(...qValues);
    const exps = qValues.map((q) => Math.exp(q - maxQ));
    const sumExps = exps.reduce((a, b) => a + b, 0);
    return exps.map((e) => e / sumExps);
  }

  _selectAction(qValues, explore = true) {
    if (explore && Math.random() < this.explorationRate) {
      return Math.floor(Math.random() * ACTIONS.length);
    }
    return qValues.indexOf(Math.max(...qValues));
  }

  _computeLoss(predicted, target) {
    return 0.5 * (target - predicted) ** 2;
  }

  async predict(marketData) {
    const features = this._extractFeatures(marketData);
    const qValues = this._predict(features);
    const actionIdx = this._selectAction(qValues, false);
    const probs = this._softmax(qValues);
    const direction = actionIdx === 0 ? "UP" : "DOWN";
    const confidence = probs[actionIdx];
    const predictedPrice = marketData
      ? direction === "UP"
        ? marketData.price * (1 + confidence * 0.01)
        : marketData.price * (1 - confidence * 0.01)
      : 0;

    const prediction = {
      symbol: marketData?.symbol || "UNKNOWN",
      direction,
      confidence: Number(confidence.toFixed(4)),
      predictedPrice: Number(predictedPrice.toFixed(4)),
      timestamp: Date.now(),
      agentVersion: this.episodeCount,
    };

    await prisma.prediction.create({
      data: {
        agentId: this.agentId,
        symbol: prediction.symbol,
        direction: prediction.direction,
        confidence: prediction.confidence,
        predictedPrice: prediction.predictedPrice,
      },
    });

    await redis.setex(
      `${PREDICTION_CACHE_PREFIX}${this.agentId}`,
      30,
      JSON.stringify(prediction)
    );

    return prediction;
  }

  async train(marketData, actualReturn) {
    const features = this._extractFeatures(marketData);
    const qValues = this._predict(features);
    const actionIdx = this._selectAction(qValues, true);
    const action = ACTIONS[actionIdx];

    let reward = 0;
    if (actualReturn > 0 && action === "BUY") reward = actualReturn * 10;
    else if (actualReturn < 0 && action === "SELL") reward = Math.abs(actualReturn) * 10;
    else if (Math.abs(actualReturn) < 0.001 && action === "HOLD") reward = 1;
    else reward = -Math.abs(actualReturn) * 5;

    const target = qValues[actionIdx] + this.learningRate * (reward + this.discountFactor * Math.max(...qValues) - qValues[actionIdx]);
    const loss = this._computeLoss(qValues[actionIdx], target);

    for (let f = 0; f < STATE_FEATURES; f++) {
      const gradient = features[f] * (qValues[actionIdx] - target);
      this.weights[actionIdx * STATE_FEATURES + f] -= this.learningRate * gradient;
    }

    this.episodeCount++;
    this.totalReward += reward;
    this.lastReward = reward;
    this.explorationRate = Math.max(this.minExplorationRate, this.explorationRate * this.explorationDecay);

    const accuracy = Math.abs(reward) / (Math.abs(actualReturn * 10) + 0.001);

    await prisma.agentConfig.update({
      where: { id: this.agentId },
      data: {
        modelState: this._getState(),
        accuracy: Math.min(1, accuracy),
        lastTraining: new Date(),
      },
    });

    return {
      episode: this.episodeCount,
      reward: Number(reward.toFixed(4)),
      accuracy: Number(Math.min(1, accuracy).toFixed(4)),
      loss: Number(loss.toFixed(6)),
      timestamp: Date.now(),
      action,
      explorationRate: this.explorationRate,
    };
  }

  async selfTrain(symbols, iterations = 10) {
    const results = [];
    for (let i = 0; i < iterations; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const history = await prisma.unifiedFeed.findMany({
        where: { symbol },
        orderBy: { timestamp: "desc" },
        take: 50,
      });

      if (history.length < 2) continue;

      for (let j = 0; j < history.length - 1; j++) {
        const current = history[j];
        const next = history[j + 1];
        const actualReturn = ((next.price - current.price) / current.price) * 100;

        const marketData = {
          symbol: current.symbol,
          price: current.price,
          volume: current.volume,
          high24h: current.high24h,
          low24h: current.low24h,
          change24h: current.change24h,
          bid: current.bid,
          ask: current.ask,
          spread: current.spread,
        };

        const result = await this.train(marketData, actualReturn);
        results.push(result);
      }
    }
    return results;
  }
}
