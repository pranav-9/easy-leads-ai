**API Documentation** 

---

# **Easy Leads - API Documentation**  

## **1. Botpress Service**  
### **Base Path:** `/botpress`  
Handles lead conversations, integrates with OpenAI, and communicates with Botpress.

### **Endpoints:**  

#### **1.1 Start Conversation**  
- **Endpoint:** `POST /botpress/start`  
- **Description:** Initiates a conversation with a lead.  
- **Request Payload:**
  ```json
  {
    "lead": {
      "_id": "64b5c1e2f2e4a1a5d6e9f832",
      "name": "John Doe",
      "phone": "+1234567890",
      "industry": "SaaS",
      "budget": "5000",
      "jobTitle": "CTO"
    }
  }
  ```
- **Response:**  
  ```json
  {
    "message": "Conversation started successfully.",
    "initialMessage": "Hey there! 😊 We noticed you're in SaaS and might be looking for solutions. What’s your estimated budget?"
  }
  ```

---

#### **1.2 Process User Response**  
- **Endpoint:** `POST /botpress/respond`  
- **Description:** Processes user input, generates AI response, and updates the chat summary.  
- **Request Payload:**  
  ```json
  {
    "leadId": "64b5c1e2f2e4a1a5d6e9f832",
    "message": "I'm looking for a CRM solution."
  }
  ```
- **Response:**  
  ```json
  {
    "botResponse": "We offer a range of CRM solutions tailored for SaaS companies. Would you like to schedule a demo?",
    "updatedSummary": "User: I'm looking for a CRM solution.\nBot: We offer a range of CRM solutions tailored for SaaS companies. Would you like to schedule a demo?"
  }
  ```

---

## **2. Settings Service**  
### **Base Path:** `/settings`  
Stores and retrieves chatbot and ICP configuration settings.

### **Endpoints:**  

#### **2.1 Get Chatbot Settings**  
- **Endpoint:** `GET /settings/chatbot`  
- **Description:** Retrieves chatbot configuration.  
- **Response:**  
  ```json
  {
    "tone": "friendly",
    "defaultMessage": "Hey there! 😊 We noticed you're in [industry] and might be looking for solutions. What’s your estimated budget?"
  }
  ```

---

#### **2.2 Get ICP Settings**  
- **Endpoint:** `GET /settings/icp`  
- **Description:** Fetches Ideal Customer Profile (ICP) settings.  
- **Response:**  
  ```json
  {
    "targetIndustries": ["SaaS", "E-commerce"],
    "preferredJobTitles": ["CTO", "Head of Growth"],
    "budgetRange": "2000-10000"
  }
  ```

---

## **3. Lead Service**  
### **Base Path:** `/leads`  
Handles lead data retrieval and updates.

### **Endpoints:**  

#### **3.1 Get Lead by ID**  
- **Endpoint:** `GET /leads/:leadId`  
- **Description:** Fetches a lead’s details.  
- **Response:**  
  ```json
  {
    "_id": "64b5c1e2f2e4a1a5d6e9f832",
    "name": "John Doe",
    "phone": "+1234567890",
    "industry": "SaaS",
    "budget": "5000",
    "jobTitle": "CTO"
  }
  ```

---

#### **3.2 Update Lead Information**  
- **Endpoint:** `PATCH /leads/:leadId`  
- **Description:** Updates lead details.  
- **Request Payload:**  
  ```json
  {
    "budget": "7000",
    "industry": "FinTech"
  }
  ```
- **Response:**  
  ```json
  {
    "message": "Lead updated successfully."
  }
  ```

---

## **4. Lead Scoring Service**  
### **Base Path:** `/lead-scoring`  
Handles lead qualification and scoring.

### **Endpoints:**  

#### **4.1 Update Lead Score**  
- **Endpoint:** `POST /lead-scoring/update`  
- **Description:** Adjusts the lead score based on interaction and engagement.  
- **Request Payload:**  
  ```json
  {
    "leadId": "64b5c1e2f2e4a1a5d6e9f832",
    "scoreChange": 5
  }
  ```
- **Response:**  
  ```json
  {
    "message": "Lead score updated.",
    "newScore": 85
  }
  ```

---

#### **4.2 Check Lead Qualification**  
- **Endpoint:** `GET /lead-scoring/:leadId`  
- **Description:** Determines if a lead is sales-ready.  
- **Response:**  
  ```json
  {
    "leadId": "64b5c1e2f2e4a1a5d6e9f832",
    "status": "Sales-Ready",
    "score": 90
  }
  ```

---

# **Summary**  

| **Service**           | **Endpoints**                 | **Description**                              |
|-----------------------|-----------------------------|----------------------------------------------|
| **Botpress Service**  | `/botpress/start`           | Starts a conversation with a lead           |
|                       | `/botpress/respond`         | Processes user input and generates a reply  |
| **Settings Service**  | `/settings/chatbot`         | Retrieves chatbot settings                  |
|                       | `/settings/icp`             | Fetches ICP settings                        |
| **Lead Service**      | `/leads/:leadId` (GET)      | Fetches a lead’s information                |
|                       | `/leads/:leadId` (PATCH)    | Updates lead details                        |
| **Lead Scoring**      | `/lead-scoring/update`      | Adjusts lead score based on engagement      |
|                       | `/lead-scoring/:leadId`     | Determines if lead is sales-qualified       |

---

This should give a **clear structure** of the APIs we have implemented so far. 🚀  
Would you like to **expand any section** or move forward with another feature?