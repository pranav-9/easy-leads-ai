Here’s a service document explaining and listing the services we have implemented so far:  

---

# **Easy Leads - Backend Service Documentation**  

## **Overview**  
The Easy Leads backend consists of multiple services that manage lead conversations, chatbot interactions, lead scoring, and system configurations. Each service plays a crucial role in processing messages, storing conversation summaries, analyzing responses, and qualifying leads.  

---

## **1. Botpress Service**  
### **Purpose:**  
Handles communication between the system and Botpress, processing user messages and generating AI-based responses.  

### **Responsibilities:**  
- Initiates conversations with leads.  
- Retrieves chatbot and ICP settings.  
- Generates the first message dynamically based on lead details and chatbot configuration.  
- Sends messages to Botpress.  
- Processes incoming responses from leads.  
- Fetches stored conversation summaries from the database.  
- Calls OpenAI to generate AI-driven responses.  
- Updates the chat summary collection with the latest conversation.  

### **Key Functions:**  
- `startConversation(lead: Lead)`: Initializes the chat with a lead, stores an initial summary, and sends the first message.  
- `processResponse(lead: Lead, message: string)`: Processes the incoming message, updates the chat summary, generates a response using OpenAI, and sends it back to Botpress.  
- `sendToBotpress(phone: string, message: string)`: Sends a message to Botpress API.  
- `generateResponseFromAiClient(previousSummary: string, message: string)`: Calls OpenAI API to generate a contextual response.  

---

## **2. Settings Service**  
### **Purpose:**  
Stores and retrieves chatbot configuration and ideal customer profile (ICP) settings.  

### **Responsibilities:**  
- Stores chatbot settings (e.g., tone, approach).  
- Manages ICP settings (target industry, role, budget preferences).  
- Provides these settings to the Botpress service to personalize conversations.  

### **Key Functions:**  
- `getChatbotSettings()`: Retrieves chatbot configuration from the database.  
- `getICPSettings()`: Fetches ICP-related settings to personalize responses.  

---

## **3. Lead Service**  
### **Purpose:**  
Manages lead information and facilitates engagement tracking.  

### **Responsibilities:**  
- Stores lead details such as name, phone number, industry, and budget.  
- Retrieves lead information when a conversation starts.  
- Integrates with Botpress Service for chatbot interaction.  

### **Key Functions:**  
- `getLeadById(leadId: string)`: Fetches lead details from the database.  
- `updateLead(leadId: string, updates: any)`: Updates lead information dynamically.  
- `storeLeadMessage(leadId: string, message: string)`: Logs lead interactions.  

---

## **4. Lead Scoring Service**  
### **Purpose:**  
Evaluates lead engagement and dynamically adjusts lead scores based on interaction quality.  

### **Responsibilities:**  
- Updates lead scores based on explicit and implicit factors.  
- Detects buying signals and sentiment from user responses.  
- Determines whether the lead qualifies for a sales handoff.  

### **Key Functions:**  
- `updateLeadScore(leadId: string, scoreChange: number)`: Adjusts lead score based on engagement and sentiment.  
- `evaluateEngagement(message: string)`: Analyzes user engagement to modify lead score dynamically.  
- `checkQualificationStatus(leadId: string)`: Determines if the lead is sales-ready, warm, or cold and triggers appropriate actions.  

