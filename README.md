# 🍽️ NutriTrack – Application for Food Tracking

**NutriTrack** is a mobile-first web application designed to help users monitor their daily food intake, understand the nutritional values of the foods they consume, and receive personalized recommendations and feedback based on their health goals.  
The project combines a nutritional database with an intelligent recommendation system tailored to each user's preferences and dietary needs.

---

## 🎯 Project Goals

- Provide a simple and intuitive way to log daily meals.
- Display caloric and nutritional intake in a clear and accessible format.
- Adapt the experience based on the user’s goals (weight loss, glucose watch, muscle gain, etc.).
- Generate personalized food recommendations that consider preferences and restrictions.
- Build a platform that can be extended with advanced analytics and artificial intelligence features.

---

## 👥 User Stories

### Regular Users
- *As a user who wants to lose weight, I want to see how many calories I’ve consumed in a day so I can adjust my diet.*
- *As a user who barely eats but keeps gaining weight, I want to see how the food I consume adds up.*
- *As a user concerned about metabolic health, I want to track my carbohydrate intake to avoid prediabetes risk.*
- *As a user with high blood pressure, I want to monitor my sodium intake to keep it within healthy limits.*
- *As an almond mom, I want to see how much fiber I consume daily.*
- *As a gym bro, I want to track my protein intake to support my fitness goals.*
- *As a unique person, I want the app to suggest nutritional goals that are not a one-size-fits-all.*
- *As a concerned parent, I want to know my child's caloric intake to prevent obesity.*
- *As a user who is always dehydrated, I want to monitor my water intake.*
- *As someone passionate about patterns, I want to see my nutritional analysis throught the week.*
- *As a tryhard user, I want to receive a personalized analysis of my daily food intake, so that I can understand how well I met my nutritional targets*
- *As a modern user, I want to receive intelligent recommendations based on my nutritional goals.*

### Nutritionists / Professionals
- *As a nutritionist, I want to analyze a user’s food history to offer personalized advice.*

---

## 🧱 Project Structure

- **User Interface** – for entering foods, viewing progress, and managing preferences.
- **Data Management System** – for storing foods, nutritional values, and user history.
- **Recommendation Engine** – for generating personalized suggestions.
- **Nutritional Analysis Module** – for calculating daily intake and comparing it with user goals.

| Layer | Technology |
|---------|------------|
| Frontend | React, Vite, JavaScript |
| Backend | FastAPI, Python |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Authentication | JWT |
| AI Agent 1 | Gemma 2 (2B) via Ollama |
| AI Agent 2 | Llama 3.2 (1B) via Ollama |
| AI Serving | Ollama |
| Push Notifications | Web Push API, PyWebPush |
| Containerization | Docker, Docker Compose |
| Deployment Platform | Railway |

---

## Diagrams

<img width="4851" height="3300" alt="image" src="https://github.com/user-attachments/assets/f09f2f00-a4bd-4b13-a71a-49dcc3acc148" />


---

 - [Documentație Proiect](https://docs.google.com/document/d/1M2nvqz48TDr96de4k4yPx63UPh21SGLidIhVe7MDONg/edit)
 - Live demo: [https://nutrition-app-production-ffa6.up.railway.app/](https://nutrition-app-production-ffa6.up.railway.app/)
 - Recorded demo: [https://youtu.be/7ZA0HMPnfmw](https://youtu.be/7ZA0HMPnfmw)


---

## 🚀 Future Directions

- Meal planning per week with recipes.
- Food DataBase filtering based on allergies.
- Barcode scanning for quick product identification.
- Smart notifications (e.g., “you’ve exceeded your sodium limit today”).
- A dedicated nutritionist mode with access to client data.
- Enhanced recommendations powered by more advanced AI models.

---
