from sklearn.model_selection import train_test_split
from datasets import Dataset
import pandas as pd
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
import torch
import evaluate
import csv
import os
import google.generativeai as genai
import json

df = pd.read_csv(r"shuffled_DB.csv")

label_mapping = {"CREATE": 0, "READ": 1, "UPDATE": 2, "DELETE": 3, "DELETE_CONDITIONED_BASED": 4,
                 "READ_CONDITION_BASED_DATA": 5, "INSERT": 6}
df["labels"] = df["labels"].map(label_mapping)


train_texts, test_texts, train_labels, test_labels = train_test_split(
    df["text"].tolist(),
    df["labels"].tolist(),
    test_size=0.3,
    random_state=42
)

# Convert to Hugging Face Dataset format
train_dataset = Dataset.from_dict({"text": train_texts, "labels": train_labels})
test_dataset = Dataset.from_dict({"text": test_texts, "labels": test_labels})

# Load tokenizer and model
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
model = AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased", num_labels=7)

# Move model to the correct device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)

# Tokenize the dataset
def tokenize_function(example):
    return tokenizer(example["text"], truncation=True, padding="max_length", max_length=128)

train_dataset = train_dataset.map(tokenize_function, batched=True)
test_dataset = test_dataset.map(tokenize_function, batched=True)

# Set dataset format for PyTorch
train_dataset.set_format(type="torch", columns=["input_ids", "attention_mask", "labels"])
test_dataset.set_format(type="torch", columns=["input_ids", "attention_mask", "labels"])

# Verify PyTorch installation
try:
    print("PyTorch is available. Version:", torch.__version__)
except ImportError:
    print("PyTorch is not installed.")

# Define training arguments
training_args = TrainingArguments(
    output_dir="./results",            # Directory to save checkpoints
    eval_strategy="epoch",      # Evaluate after every epoch
    save_strategy="epoch",            # Save after every epoch
    learning_rate=2e-5,               # Fine-tuning learning rate
    per_device_train_batch_size=20,   # Batch size for training
    per_device_eval_batch_size=16,    # Batch size for evaluation
    num_train_epochs=4,               # Number of epochs
    weight_decay=0.01,                # Weight decay
    logging_dir="./logs",             # Logging directory
    load_best_model_at_end=True,      # Load best model at the end
    metric_for_best_model="accuracy", # Metric to track the best model
    logging_steps=10                  # Log every 10 steps
)

# Load accuracy metric using evaluate
metric = evaluate.load("accuracy")

# Compute metrics function
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = torch.argmax(torch.tensor(logits), axis=1)
    return metric.compute(predictions=predictions, references=labels)

# Check if model is already saved
save_directory = "./final_model"
if not os.path.exists(save_directory):
    # Initialize Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=test_dataset,
        tokenizer=tokenizer,
        compute_metrics=compute_metrics
    )

    # Train the model
    trainer.train()

    # Save the model and tokenizer
    trainer.save_model(save_directory)
    tokenizer.save_pretrained(save_directory)
    print(f"Model and tokenizer saved in '{save_directory}'")
else:
    print(f"Model already exists in '{save_directory}'")

# Load the saved model and tokenizer
loaded_tokenizer = AutoTokenizer.from_pretrained(save_directory)
loaded_model = AutoModelForSequenceClassification.from_pretrained(save_directory).to(device)


def predict_text(texts):
    if isinstance(texts, str):
        texts = [texts]  # Convert single input to list
    
    inputs = loaded_tokenizer(texts, return_tensors="pt", truncation=True, padding="max_length", max_length=128)
    inputs = {key: value.to(device) for key, value in inputs.items()}  # Move to correct device

    loaded_model.eval()
    with torch.no_grad():
        outputs = loaded_model(**inputs)
    
    logits = outputs.logits
    probabilities = torch.nn.functional.softmax(logits, dim=1)  # Convert logits to probabilities
    predicted_classes = torch.argmax(probabilities, dim=1).tolist()  # Convert to list of predicted labels

    label_map_inverse = {v: k for k, v in label_mapping.items()}
    return [{"text": t, "intent": label_map_inverse[p], "confidence": max(prob.tolist())} for t, p, prob in zip(texts, predicted_classes, probabilities)]


# # Test the model on a sample text
# query = "Change the name of the entry which have age>0 and height<120 and whose count is 100"


# bert_response = predict_text(query)
# print("Predicted Intent by bert model:", bert_response[0]['intent'])

crud_examples = {
    "Insert a new document into the 'users' collection.": "INSERT",  # If you're distinguishing
    "Retrieve the details of product ID 123.": "READ",
    "Get the information for user ID 'abc123'.": "READ",
    "Find me the details of the order with ID 'order456'.": "READ",
    "Change the price of product ID 456 to $25.": "UPDATE",
    "Update the customer's address to '123 Main St' for customer ID 789.": "UPDATE",
    "Modify the 'products' collection by setting 'stock' to 0 where 'product_id' is 'xyz789'.": "UPDATE",
    "Remove the customer with ID 789.": "DELETE",
    "Delete product ID 'pqr987' from the database.": "DELETE",
    "Remove the user account associated with email 'test@example.com'.": "DELETE",
    "Delete all orders placed before January 1, 2023.": "DELETE_CONDITIONED_BASED",
    "Delete all products with a price less than $100.": "DELETE_CONDITIONED_BASED",
    "Remove all users whose age is greater than 60.": "DELETE_CONDITIONED_BASED",
    "Find all products with a price greater than $50.": "READ_CONDITION_BASED_DATA",
    "Retrieve all customers who live in New York City.": "READ_CONDITION_BASED_DATA",
    "Get all orders placed between January 1, 2023, and March 1, 2023.": "READ_CONDITION_BASED_DATA",
    "Insert a new record into the 'orders' table.": "INSERT",  # If you're distinguishing
    "Find the latest 10 blog posts.": "READ_CONDITION_BASED_DATA", # Example of a more complex query
    "Update the status of all pending orders to 'processing'." : "UPDATE", # Batch update
    "Delete all users who haven't logged in for more than a year.": "DELETE_CONDITIONED_BASED", # More complex conditional delete
    "Retrieve the details of product ID 123.": "READ",
    "Get the information for user ID 'abc123'.": "READ",
    "Find me the details of the order with ID 'order456'.": "READ",

    "Update the email of user ID 'user789' to 'newemail@example.com'.": "UPDATE",
    "Delete all records from the orders table.": "DELETE",
    "Remove the user with ID 'user789'.": "DELETE_CONDITIONED_BASED",
    "Find all orders placed after January 1, 2024.": "READ_CONDITION_BASED_DATA",
    "Insert a new product named 'Wireless Mouse' with price $25.": "INSERT",
    "Fetch the details of employees in the IT department.": "READ_CONDITION_BASED_DATA",
    "Change the salary of employee ID 'emp456' to 60000.": "UPDATE",
    "Delete all inactive customer accounts.": "DELETE_CONDITIONED_BASED",
    "Insert a new book titled 'Python Basics' with author 'John Smith'.": "INSERT",
    "Retrieve all transactions made by user 'user123'.": "READ_CONDITION_BASED_DATA",

    "Modify the phone number of customer ID 'cust999' to '555-1234'.": "UPDATE",
    "Get a list of all products in stock.": "READ",
    "Delete orders that were canceled before 2023.": "DELETE_CONDITIONED_BASED",
    "Insert a new blog post titled 'AI Revolution' with category 'Technology'.": "INSERT",
    "Fetch details of students who scored above 90% in Mathematics.": "READ_CONDITION_BASED_DATA",
    "insert the data of a new employee into the 'employees' table.": "INSERT",
    "Update the address of customer ID 'cust123' to '456 Elm St'.": "UPDATE",
    "Delete all inactive user accounts.": "DELETE_CONDITIONED_BASED",
    "add this data":"INSERT",
    "convert name equal john to samarth":"UPDATE",
    "delete the entry which have name == jenil":"DELETE_CONDITIONED_BASED",
    "give me entries of the table where name is samarth":"READ_CONDITION_BASED_DATA",
    "insert data : ":"INSERT",
    "insert entries of table where name is samarth":"INSERT",
    "update the entry where name is samarth":"UPDATE",
    "delete the entry where name is samarth":"DELETE_CONDITIONED_BASED"
}


# gemini_response = model.generate_content(query)
# print("generated by gemini:"+gemini_response.text.strip())


INCORRECT_SAMPLES_FILE = "incorrect_samples.csv"

def log_incorrect_prediction(text, predicted_label, correct_label):
    file_exists = os.path.exists(INCORRECT_SAMPLES_FILE)
    
    with open(INCORRECT_SAMPLES_FILE, "a", newline="") as file:
        writer = csv.writer(file)
        if not file_exists:
            writer.writerow(["text", "predicted_label", "correct_label"])  # Write header if file doesn't exist
        writer.writerow([text, predicted_label, correct_label])


for i in range(0,len(crud_examples)):
    query = list(crud_examples.keys())[i]
    bert_response = predict_text(query)
    
    actual_intent = crud_examples[query]

    # print(bert_response[0].get('intent'))
    if bert_response[0].get('intent') != actual_intent:
        log_incorrect_prediction(query, bert_response[0].get('intent'), actual_intent)
        



def retrain_model():
    incorrect_df = pd.read_csv(INCORRECT_SAMPLES_FILE)
    
    # Map back to numerical labels
    incorrect_df["labels"] = incorrect_df["correct_label"].map(label_mapping)

    # Add new samples to training dataset
    global train_texts, train_labels
    train_texts.extend(incorrect_df["text"].tolist())
    train_labels.extend(incorrect_df["labels"].tolist())

    # Convert updated dataset
    train_dataset = Dataset.from_dict({"text": train_texts, "labels": train_labels})
    train_dataset = train_dataset.map(tokenize_function, batched=True)
    train_dataset.set_format(type="torch", columns=["input_ids", "attention_mask", "labels"])

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=test_dataset,
        tokenizer=tokenizer,
        compute_metrics=compute_metrics
    )
    new_save_directory = "./final_model_2"
    trainer.train()
    trainer.save_model(new_save_directory)
    tokenizer.save_pretrained(new_save_directory)
    print("Model retrained and saved.")


retrain_model()

#INTRO
#PREOBLEML
#TECH STACK
#SOLUTION
#IMPACT
#IMAGES OF PROTOTYPE

#TO THE POINT

#YT VIDEO-DEVFOLIO
