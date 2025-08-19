import os
from temporalio.client import Client

class TemporalClientSingleton:
  _instance = None

  def __init__(self):
    self.client = None

  def __new__(cls):
    if cls._instance is None:
      cls._instance = super(TemporalClientSingleton, cls).__new__(cls)
      cls._instance.client = None
    return cls._instance

  async def connect(self, endpoint=None):
    if endpoint is None:
      endpoint = os.getenv("TEMPORAL_ADDRESS", "localhost:7233")
    if self.client is None:
      self.client = await Client.connect(endpoint)
    return self.client

# Instantiate the client on the first request
temporal_client = TemporalClientSingleton()
