"use client";

import { useState } from "react";

export default function PredictionPanel() {
  const [symbol, setSymbol] = useState("AAPL");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState(false);
  const [trainResult, setTrainResult] = useState(null);

  async function getPrediction() {
    setLoading(true);
    try {
      const res = await fetch(`/api/rl?action=predict&symbol=${symbol}`);
      const data = await res.json();
      setPrediction(data);
    } catch (err) {
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function startTraining() {
    setTraining(true);
    try {
      const res = await fetch("/api/rl?action=train-full");
      const data = await res.json();
      setTrainResult(data);
    } catch (err) {
      console.error("Training error:", err);
    } finally {
      setTraining(false);
    }
  }

  return (
    <div className="bg-card rounded-lg border border-default p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">AI Prediction Engine</h3>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Symbol"
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm w-24 focus:outline-none focus:border-blue-500"
        />
        <button
          type="button"
          onClick={getPrediction}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-3 py-1 rounded font-medium"
        >
          {loading ? "..." : "Predict"}
        </button>
      </div>

      {prediction && (
        <div className="space-y-2 text-sm mb-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Direction</span>
            <span className={prediction.direction === "UP" ? "text-green font-bold" : "text-red font-bold"}>
              {prediction.direction === "UP" ? "▲ BUY" : "▼ SELL"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Confidence</span>
            <span className="font-medium">{(prediction.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Target Price</span>
            <span className="font-medium">${prediction.predictedPrice?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Model Version</span>
            <span className="font-medium">v{prediction.agentVersion}</span>
          </div>
        </div>
      )}

      <div className="border-t border-gray-700 pt-3 mt-2">
        <button
          type="button"
          onClick={startTraining}
          disabled={training}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white text-sm px-3 py-2 rounded font-medium"
        >
          {training ? "Self-Training..." : "▶ Self-Train Agent"}
        </button>

        {trainResult && (
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Episodes</span>
              <span>{trainResult.episodes}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Avg Accuracy</span>
              <span className="text-green">{(trainResult.avgAccuracy * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Total Reward</span>
              <span className={trainResult.totalReward >= 0 ? "text-green" : "text-red"}>{trainResult.totalReward.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Exploration Rate</span>
              <span>{(trainResult.finalExplorationRate * 100).toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
