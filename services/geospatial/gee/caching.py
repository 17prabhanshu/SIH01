import hashlib
import json
import logging
from typing import Any, Dict, Optional
import time

logger = logging.getLogger(__name__)

class GEECache:
    """Caching mechanism for GEE computation results."""
    
    def __init__(self, use_redis: bool = False, redis_url: str = None, cache_dir: str = "/tmp/gee_cache"):
        self.use_redis = use_redis
        self.cache_dir = cache_dir
        self.redis_client = None
        
        if self.use_redis and redis_url:
            import redis
            self.redis_client = redis.Redis.from_url(redis_url)
        else:
            import os
            os.makedirs(self.cache_dir, exist_ok=True)
            
    def _generate_key(self, query_params: Dict[str, Any]) -> str:
        """Generate a unique hash for the query."""
        serialized = json.dumps(query_params, sort_keys=True)
        return hashlib.sha256(serialized.encode('utf-8')).hexdigest()

    def get(self, query_params: Dict[str, Any]) -> Optional[Any]:
        """Retrieve result from cache."""
        key = self._generate_key(query_params)
        
        if self.use_redis and self.redis_client:
            data = self.redis_client.get(key)
            return json.loads(data) if data else None
        else:
            import os
            filepath = os.path.join(self.cache_dir, f"{key}.json")
            if os.path.exists(filepath):
                with open(filepath, 'r') as f:
                    return json.load(f)
        return None
        
    def set(self, query_params: Dict[str, Any], result: Any, ttl: int = 86400):
        """Store result in cache with TTL."""
        key = self._generate_key(query_params)
        
        if self.use_redis and self.redis_client:
            self.redis_client.setex(key, ttl, json.dumps(result))
        else:
            import os
            filepath = os.path.join(self.cache_dir, f"{key}.json")
            with open(filepath, 'w') as f:
                json.dump(result, f)
