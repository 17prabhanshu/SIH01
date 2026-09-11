#!/bin/bash
echo "Waiting for API to start..."
for i in {1..300}; do
    if curl -s http://127.0.0.1:8000/health > /dev/null; then
        echo "API is up!"
        ./test_e2e_pipeline.sh
        exit 0
    fi
    sleep 2
done
echo "API did not start in time."
exit 1
