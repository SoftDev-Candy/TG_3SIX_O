import torch
import pandas as pd
import json
import pickle

try:
    from chronos import ChronosPipeline
except ImportError:
    print("ERROR: chronos library not found!")
    print("Install it with: pip install git+https://github.com/amazon-science/chronos-forecasting.git")
    exit(1)

df = pd.read_csv(r"c:\Users\Marvellous\Downloads\mock_delays.csv")
print("Loading Chronos model (this may take a moment)...")

models_to_try = [
    "amazon/chronos-t5-tiny",    
    "amazon/chronos-t5-small", 
    "amazon/chronos-bolt-tiny",  
]

pipeline = None
for model_name in models_to_try:
    try:
        print(f"Trying to load: {model_name}")
        pipeline = ChronosPipeline.from_pretrained(
            model_name,
            device_map="cpu",
            torch_dtype=torch.float32,
        )
        print(f"✓ Successfully loaded {model_name}!\n")
        break
    except Exception as e:
        print(f"✗ Failed to load {model_name}: {str(e)[:100]}")
        continue

if pipeline is None:
    print("\nERROR: Could not load any Chronos model.")
    print("Try updating: pip install git+https://github.com/amazon-science/chronos-forecasting.git --upgrade")
    exit(1)

forecasts = {}

# Loop over each route
for route in df["route_id"].unique():
    series = df[df["route_id"] == route]["delay"].values
    print(f"Processing route {route} with {len(series)} historical data points...")

    context = torch.tensor(series, dtype=torch.float32)
    
    try:
        forecast = pipeline.predict(
            context=context,
            prediction_length=10,
            num_samples=20,  # sample paths
        )
        median_forecast = forecast.median(dim=1).values.squeeze().tolist()
        
        if not isinstance(median_forecast, list):
            median_forecast = [median_forecast]
        forecasts[route] = median_forecast
        
        print(f"  → Predicted delays: {[round(x, 2) for x in median_forecast]}\n")
        
    except Exception as e:
        print(f"  ✗ Error predicting for route {route}: {e}\n")
        forecasts[route] = None

print("=" * 60)

forecasts_str_keys = {str(int(k)): v for k, v in forecasts.items()}
with open("raw_forecasts.json", "w") as f:
    json.dump(forecasts_str_keys, f, indent=4)

with open("raw_forecasts.pkl", "wb") as f:
    pickle.dump(forecasts_str_keys, f)

print("All forecasts:")
for route, forecast in forecasts.items():
    if forecast:
        print(f"Route {route}: {[round(x, 2) for x in forecast]}")
    else:
        print(f"Route {route}: Failed")