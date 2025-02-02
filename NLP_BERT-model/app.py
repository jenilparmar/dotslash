'''Server'''
from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import os 
from dotenv import load_dotenv
from flask_cors import CORS
import google.generativeai as genai



GEMINI_API_KEY= "AIzaSyA3dPhVuCa7Q4j-MXzq-P9uatgGOKt0y1g"
app = Flask(__name__)
CORS(app=app)
# Check if model is already saved
save_directory = "./final_model_2"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

if os.path.exists(save_directory):
    # Load the saved model and tokenizer
    tokenizer = AutoTokenizer.from_pretrained(save_directory)
    model = AutoModelForSequenceClassification.from_pretrained(save_directory).to(device)
    print(f"Model and tokenizer loaded from '{save_directory}'")
else:
    print(f"Model not found in '{save_directory}', please ensure the model is saved before starting the server.")

# Configure Gemini API
genai.configure(api_key="AIzaSyA3dPhVuCa7Q4j-MXzq-P9uatgGOKt0y1g")

def get_gemini_response(input_text):
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content([input_text]).text
    return response

def extract_db_and_collection(input_text):
    # Get response from Gemini
    response = get_gemini_response(input_text)

    # Parse the response (assumes "database:<dbname>\ncollection:<colname>")
    lines = response.strip().split('\n')  # Remove any extra newlines and split lines
    db_name = lines[0].split(':')[1].strip()  # Extract database name
    col_name = lines[1].split(':')[1].strip()  # Extract collection name

    # Return as an array
    return [db_name, col_name]
# Predict function for new text input using the saved model
def predict_text(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding="max_length", max_length=128)
    inputs = {key: value.to(device) for key, value in inputs.items()}  # Move inputs to the correct device
    model.eval()  # Set model to evaluation mode
    with torch.no_grad():  # Disable gradient calculation
        outputs = model(**inputs)
    logits = outputs.logits
    predicted_class = torch.argmax(logits, dim=1).item()
    # Reverse the label mapping to get the string corresponding to the class
    label_mapping = {
        0: "CREATE", 1: "READ", 2: "UPDATE", 3: "DELETE", 4: "DELETE_CONDITIONED_BASED",
        5: "READ_CONDITION_BASED_DATA", 6: "INSERT"
    }
    return label_mapping.get(predicted_class, "Unknown")

@app.route('/GETJOY', methods=['GET'])
def application():
    return "hi"
    
@app.route('/getIntent', methods=['POST'])
def post_data():
    data = request.get_json()
    if not data or 'paragraph' not in data:
        return jsonify({"response": "false"})
    
    intent = predict_text(data['paragraph'])
    print(data['paragraph'])
    print(intent)
    res = []
    gem  = get_gemini_response(f'i will give you the peragraph in brackets i want to extract the name of database and name of collection from that and return me just in one lines one word for dbname one word for colname give me ,  saparated values as response nothing more nothing less give({data["paragraph"]})')
    # print(gem)
    return jsonify({"intent": intent , 
                    "DB_info":gem})


if __name__ == '__main__':
    app.run(host='0.0.0.0' , debug=True)

