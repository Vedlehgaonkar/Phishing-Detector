# Phishing Detector

## Overview

Phishing Detector is an AI-powered phishing website detection system developed using Python, Flask, Machine Learning, and a Chrome Extension.

The system analyzes websites and detects potential phishing threats based on:

* Suspicious URLs
* Fake Login Pages
* Credential Harvesting
* Brand Impersonation
* Suspicious Domains
* Machine Learning Prediction

## Technologies Used

* Python
* Flask
* Scikit-Learn
* Pandas
* JavaScript
* HTML
* CSS
* Chrome Extension (Manifest V3)

## Features

* Real-time phishing detection
* Risk score calculation
* Threat level classification
* Warning popup banner
* Machine learning based analysis
* Chrome extension integration

## Project Structure

backend/

* app.py
* model.pkl
* train_model.py
* dataset.csv
* domain_checker.py

extension/

* manifest.json
* background.js
* content.js
* popup.html
* popup.js
* popup.css

## How to Run

1. Install required packages:

pip install -r requirements.txt

2. Start Flask server:

python app.py

3. Open Chrome Extensions.

4. Enable Developer Mode.

5. Click Load Unpacked.

6. Select the extension folder.

7. Start scanning websites.

## Author

Ved Lehgaonkar
