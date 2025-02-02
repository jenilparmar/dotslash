#Code to shuffle the list(dataset)

import csv
import random

# File paths
input_file = 'C:\\Users\\suraj\\Desktop\\reinforcement learning - NLP CRUD operations\\DB.csv'
output_file = 'shuffled_DB.csv'

# Read the CSV file
with open(input_file, 'r') as file:
    reader = list(csv.reader(file))
    header = reader[0]  # Extract the header
    rows = reader[1:]   # Extract the data rows

# Shuffle the rows
random.shuffle(rows)

# Write the shuffled rows back to a new CSV file
with open(output_file, 'w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(header)  # Write the header
    writer.writerows(rows)  # Write the shuffled rows

print(f"Rows have been shuffled and saved to {output_file}")
