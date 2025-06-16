from pydantic import BaseModel

class SchemaBase(BaseModel):
    model_config = {"from_attributes": True}
