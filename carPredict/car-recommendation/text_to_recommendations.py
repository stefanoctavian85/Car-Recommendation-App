from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_ollama import ChatOllama
from pydantic import BaseModel, Field
from typing import Literal

class Masina(BaseModel):
    Masina: str
    anul_productiei: int = Field(..., alias="Anul productiei")
    Pret: int
    Combustibil: Literal['Diesel', 'Electric', 'Gasoline', 'Hibrid']
    tip_caroserie: Literal['Compact', 'Minivan', 'Sedan', 'Sport', 'SUV'] = Field(..., alias="Tip Caroserie")
    cutie_viteze: Literal['Manual', 'Automatic'] = Field(..., alias='Cutie de viteze')
    Transmisie: Literal['FWD', 'RWD', 'AWD']


parser = PydanticOutputParser(pydantic_object=Masina)
format_instructions = parser.get_format_instructions()

prompt_template = ("You are a car recommendation assistant! Please, extract car attributes, where NA, please put null."
                   "Each field must contain a single value! You must return a JSON!\n"
                   "{format_instructions}\n"
                   "Text: {text}.")


prompt = PromptTemplate(
    template=prompt_template,
    input_variables=["text"],
    partial_variables={"format_instructions": format_instructions},
)

chat = ChatOllama(
    model="llama3.1",
    temperature=0,
    format="json"
)

if __name__=="__main__":
    sample_text = "I would like a brand new BMW, close to 2020, that can be a sport vehicle, maybe on diesel or gasoline, automatic."
    final_prompt = prompt.format(text=sample_text)
    response = chat.invoke(final_prompt)
    print(response.content)