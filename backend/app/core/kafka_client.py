"""
Kafka Integration Module
Secure Kafka producer and consumer with encryption, authentication, and error handling
"""
from typing import Optional, Dict, Any, List, Callable
from confluent_kafka import Producer, Consumer, KafkaError, KafkaException
from confluent_kafka.admin import AdminClient, NewTopic
import json
import asyncio
from datetime import datetime, timezone
import logging
from contextlib import asynccontextmanager

from app.core.config import get_settings, get_kafka_config
from app.core.security import encryption_service


logger = logging.getLogger(__name__)


class KafkaProducerService:
    """
    Secure Kafka Producer with message encryption
    Implements reliable message delivery with retries and error handling
    """
    
    def __init__(self):
        self.producer: Optional[Producer] = None
        self.settings = get_settings()
        self._delivery_reports = []
    
    def initialize(self):
        """Initialize Kafka producer"""
        if not self.producer:
            config = get_kafka_config()
            
            # Producer-specific configuration
            producer_config = {
                **config,
                'acks': 'all',  # Wait for all replicas to acknowledge
                'retries': 3,
                'max.in.flight.requests.per.connection': 1,  # Ensure ordering
                'compression.type': 'gzip',
                'linger.ms': 10,  # Batch messages for efficiency
                'batch.size': 16384,
                'enable.idempotence': True,  # Exactly-once semantics
                'request.timeout.ms': 30000,
                'message.timeout.ms': 300000,
            }
            
            try:
                self.producer = Producer(producer_config)
                logger.info("Kafka producer initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Kafka producer: {str(e)}")
                raise
    
    def _delivery_callback(self, err, msg):
        """Callback for message delivery reports"""
        if err:
            logger.error(f'Message delivery failed: {err}')
            self._delivery_reports.append({
                'status': 'failed',
                'error': str(err),
                'topic': msg.topic(),
                'partition': msg.partition(),
                'timestamp': datetime.now(timezone.utc).isoformat()
            })
        else:
            logger.debug(
                f'Message delivered to {msg.topic()} '
                f'[{msg.partition()}] at offset {msg.offset()}'
            )
            self._delivery_reports.append({
                'status': 'success',
                'topic': msg.topic(),
                'partition': msg.partition(),
                'offset': msg.offset(),
                'timestamp': datetime.now(timezone.utc).isoformat()
            })
    
    def _encrypt_message(self, message: Dict[str, Any]) -> str:
        """Encrypt message content"""
        try:
            json_message = json.dumps(message)
            encrypted = encryption_service.encrypt_data(json_message)
            return encrypted
        except Exception as e:
            logger.error(f"Failed to encrypt message: {str(e)}")
            raise
    
    def produce(
        self,
        topic: str,
        value: Dict[str, Any],
        key: Optional[str] = None,
        headers: Optional[Dict[str, str]] = None,
        encrypt: bool = True
    ) -> bool:
        """
        Produce message to Kafka topic
        
        Args:
            topic: Kafka topic name
            value: Message value (will be encrypted if encrypt=True)
            key: Optional message key
            headers: Optional message headers
            encrypt: Whether to encrypt the message (default: True)
        
        Returns:
            True if message queued successfully
        """
        if not self.producer:
            self.initialize()
        
        try:
            # Add metadata
            message = {
                'data': value,
                'metadata': {
                    'timestamp': datetime.now(timezone.utc).isoformat(),
                    'encrypted': encrypt,
                    'version': '1.0'
                }
            }
            
            # Encrypt if required
            if encrypt:
                message_value = self._encrypt_message(message)
            else:
                message_value = json.dumps(message)
            
            # Prepare headers
            kafka_headers = []
            if headers:
                kafka_headers = [(k, v.encode('utf-8')) for k, v in headers.items()]
            
            # Add encryption flag to headers
            kafka_headers.append(('encrypted', str(encrypt).encode('utf-8')))
            
            # Produce message
            full_topic = f"{self.settings.KAFKA_TOPIC_PREFIX}.{topic}"
            
            self.producer.produce(
                topic=full_topic,
                value=message_value.encode('utf-8'),
                key=key.encode('utf-8') if key else None,
                headers=kafka_headers,
                callback=self._delivery_callback
            )
            
            # Trigger callbacks
            self.producer.poll(0)
            
            return True
            
        except BufferError:
            logger.error("Kafka producer queue is full")
            # Wait for messages to be delivered
            self.producer.flush(timeout=10)
            return False
        except Exception as e:
            logger.error(f"Failed to produce message: {str(e)}")
            return False
    
    def flush(self, timeout: float = 10.0):
        """Flush pending messages"""
        if self.producer:
            remaining = self.producer.flush(timeout)
            if remaining > 0:
                logger.warning(f"{remaining} messages were not delivered")
    
    def close(self):
        """Close producer connection"""
        if self.producer:
            self.producer.flush(timeout=30)
            self.producer = None
            logger.info("Kafka producer closed")
    
    def get_delivery_reports(self) -> List[Dict[str, Any]]:
        """Get delivery reports"""
        reports = self._delivery_reports.copy()
        self._delivery_reports.clear()
        return reports


class KafkaConsumerService:
    """
    Secure Kafka Consumer with message decryption
    Implements reliable message consumption with error handling
    """
    
    def __init__(self, group_id: Optional[str] = None):
        self.consumer: Optional[Consumer] = None
        self.settings = get_settings()
        self.group_id = group_id or self.settings.KAFKA_CONSUMER_GROUP
        self.running = False
    
    def initialize(self, topics: List[str]):
        """Initialize Kafka consumer and subscribe to topics"""
        if not self.consumer:
            config = get_kafka_config()
            
            # Consumer-specific configuration
            consumer_config = {
                **config,
                'group.id': self.group_id,
                'auto.offset.reset': 'earliest',
                'enable.auto.commit': False,  # Manual commit for reliability
                'max.poll.interval.ms': 300000,
                'session.timeout.ms': 10000,
                'heartbeat.interval.ms': 3000,
            }
            
            try:
                self.consumer = Consumer(consumer_config)
                
                # Subscribe to topics with prefix
                full_topics = [f"{self.settings.KAFKA_TOPIC_PREFIX}.{topic}" for topic in topics]
                self.consumer.subscribe(full_topics)
                
                logger.info(f"Kafka consumer subscribed to topics: {full_topics}")
            except Exception as e:
                logger.error(f"Failed to initialize Kafka consumer: {str(e)}")
                raise
    
    def _decrypt_message(self, encrypted_message: str) -> Dict[str, Any]:
        """Decrypt message content"""
        try:
            decrypted = encryption_service.decrypt_data(encrypted_message)
            return json.loads(decrypted)
        except Exception as e:
            logger.error(f"Failed to decrypt message: {str(e)}")
            raise
    
    async def consume(
        self,
        topics: List[str],
        handler: Callable[[Dict[str, Any]], asyncio.Future],
        timeout: float = 1.0
    ):
        """
        Consume messages from Kafka topics
        
        Args:
            topics: List of topic names to consume from
            handler: Async function to handle messages
            timeout: Poll timeout in seconds
        """
        if not self.consumer:
            self.initialize(topics)
        
        self.running = True
        
        try:
            while self.running:
                msg = self.consumer.poll(timeout=timeout)
                
                if msg is None:
                    await asyncio.sleep(0.1)
                    continue
                
                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        logger.debug(f"Reached end of partition: {msg.topic()}[{msg.partition()}]")
                    else:
                        logger.error(f"Consumer error: {msg.error()}")
                    continue
                
                try:
                    # Check if message is encrypted
                    headers = dict(msg.headers()) if msg.headers() else {}
                    is_encrypted = headers.get('encrypted', b'False').decode('utf-8') == 'True'
                    
                    # Decode message
                    message_value = msg.value().decode('utf-8')
                    
                    # Decrypt if needed
                    if is_encrypted:
                        message_data = self._decrypt_message(message_value)
                    else:
                        message_data = json.loads(message_value)
                    
                    # Add message metadata
                    message_data['_metadata'] = {
                        'topic': msg.topic(),
                        'partition': msg.partition(),
                        'offset': msg.offset(),
                        'key': msg.key().decode('utf-8') if msg.key() else None,
                        'timestamp': msg.timestamp()[1] if msg.timestamp() else None,
                        'headers': {k: v.decode('utf-8') for k, v in headers.items()}
                    }
                    
                    # Handle message
                    await handler(message_data)
                    
                    # Commit offset
                    self.consumer.commit(asynchronous=False)
                    
                except Exception as e:
                    logger.error(f"Error processing message: {str(e)}")
                    # Don't commit on error - message will be reprocessed
                
        except KeyboardInterrupt:
            logger.info("Consumer interrupted by user")
        finally:
            self.stop()
    
    def stop(self):
        """Stop consuming messages"""
        self.running = False
        if self.consumer:
            self.consumer.close()
            self.consumer = None
            logger.info("Kafka consumer closed")


class KafkaAdminService:
    """Kafka administration service for topic management"""
    
    def __init__(self):
        self.admin: Optional[AdminClient] = None
        self.settings = get_settings()
    
    def initialize(self):
        """Initialize Kafka admin client"""
        if not self.admin:
            config = get_kafka_config()
            self.admin = AdminClient(config)
    
    def create_topics(self, topics: List[str], num_partitions: int = 3, replication_factor: int = 1):
        """Create Kafka topics"""
        if not self.admin:
            self.initialize()
        
        new_topics = [
            NewTopic(
                f"{self.settings.KAFKA_TOPIC_PREFIX}.{topic}",
                num_partitions=num_partitions,
                replication_factor=replication_factor
            )
            for topic in topics
        ]
        
        try:
            fs = self.admin.create_topics(new_topics)
            
            for topic, f in fs.items():
                try:
                    f.result()  # Block until topic is created
                    logger.info(f"Topic {topic} created successfully")
                except Exception as e:
                    logger.error(f"Failed to create topic {topic}: {str(e)}")
                    
        except Exception as e:
            logger.error(f"Failed to create topics: {str(e)}")
    
    def list_topics(self) -> List[str]:
        """List all topics"""
        if not self.admin:
            self.initialize()
        
        metadata = self.admin.list_topics(timeout=10)
        return list(metadata.topics.keys())
    
    def delete_topics(self, topics: List[str]):
        """Delete Kafka topics"""
        if not self.admin:
            self.initialize()
        
        full_topics = [f"{self.settings.KAFKA_TOPIC_PREFIX}.{topic}" for topic in topics]
        
        try:
            fs = self.admin.delete_topics(full_topics)
            
            for topic, f in fs.items():
                try:
                    f.result()
                    logger.info(f"Topic {topic} deleted successfully")
                except Exception as e:
                    logger.error(f"Failed to delete topic {topic}: {str(e)}")
                    
        except Exception as e:
            logger.error(f"Failed to delete topics: {str(e)}")


# Global service instances
kafka_producer = KafkaProducerService()
kafka_admin = KafkaAdminService()


# Context manager for consumer
@asynccontextmanager
async def kafka_consumer(topics: List[str], group_id: Optional[str] = None):
    """Context manager for Kafka consumer"""
    consumer = KafkaConsumerService(group_id)
    consumer.initialize(topics)
    try:
        yield consumer
    finally:
        consumer.stop()
