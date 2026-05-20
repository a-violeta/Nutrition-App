# stack

frontend:
 - React
 - TypeScript
 - Vite
 - Tailwind
 - Framer Motion

backend:
 - FastAPI
 - SQLAlchemy
 - PostgreSQL
 - JWT Auth

devops:
 - Docker
 - GitHub Actions
 - Railway

# structura proiectului

 - `frontend/` → aplicatia React + Vite
 - `backend/` → API FastAPI + bd
 - `docker/` → configurare Docker (eu am folosit strict Docker Desktop)
 - `backend/tests/` → teste automate (cand faceti pull request pe branch ul `main` trebuie ca testele sa nu esueze)

# Backend Setup

recomandat: un mediu virtual. trebuie activat mereu când lucram la backend

## instructiuni mediu virtual:

comenzi Windows (recomandat mediul VS Code):
```
git clone https://github.com/a-violeta/Nutrition-App
cd Nutrition-App/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```
Selecteaza interpretorul corect de Python.
Pt mediul VS Code:
Ctrl + Shift + P
scrie: "Python: Select Interpreter"
alege: `backend\venv\Scripts\python.exe` pt Windows

## variabile de mediu

creaza un fisier denumit `.env` in root ul proiectului. in el scrieti continutul fisierului `.env.example` care e in root.
`.env` e un fisier pe care ar trebui sa il faceti in root pt a fi gasit usor si ideal ar contine configurarea personala pt testare (dar ar trebui sa mearga si aceeasi configurare ca in `.env.example`). `.env.example` are un model de `.env` pt ca `.env` teoretic nu trebuie postat public
in `.env` se afla `SECRET_KEY` care tine de autentificarea JWT iar in `.env.example` am lasat un key banal, nu cel real. inafara de `SECRET_KEY` nu e nimic secret si ideal ar fi sa nu le modificati

# testeaza:

```
cd frontend
npm install
npm run build
cd ..
docker-compose up --build
```
deschide link ul http://localhost:8000
comanda din terminal se inchide cu ctrl + c dar uneori nu merge din prima

# frontend

 - `frontend/src/components/` → componente UI precum `Dashboard`, `Auth screen`, `Search page` etc
 - `frontend/src/pages/Index.tsx` → pagina principala a aplicatiei, ecranele se schimba in functie de starea curenta (`activeTab`), nu exista rute diferite, nici pagini diferite (inafara de pagina `NotFound`)
 - `frontend/dist/` → build-ul frontend ului care e preluat de Docker/FastAPI, contine html ul pe care il vede utilizatorul, se reface cu rularea comenzii `npm run build` din directorul `frontend`
 - `frontend/src/App.tsx` are rutele aplicatiei (care e doar una de fapt, cealalta ruta de acolo nu cred ca mai e folosita)

# backend

 - `backend/app/models/` → modelele bazei de date pt aplicatie (tabele users, foods, food logs)
 - `backend/app/routers/` → endpoint uri, exemplu authentication, food log, users
 - `backend/app/db.py` → configurarea BD
 - `backend/app/main.py` → start ul aplicatiei

# docker

eu am folosit `Docker Desktop` pt testare locala

sunt 2 containere create: unul pt aplicatia in sine (`FastAPI` + frontend copiat aferent crearii sale) si unul pt baza de date `PostGres`

# CI/CD

continuous integration continuous deployment

pt asta avem `GitHub Actions` si `Railway`

## CI 

In `GitHub Actions` avem un script care ruleaza la fiecare push si pull request pe branch ul `main`, script ul verifica sa nu fie erori la rularea fisierelor python, sa se construiasca frontend ul, imaginea Docker si ruleaza 2 seturi de teste specifice aflate in `backend/tests/` anume teste unitare pt autentificare si logarea meselor (daca crapa testele astea dupa ce incearca cineva sa faca PR sau push pe `main` atunci avem o problema). testele nu pot rula pe baza de date oficiala din docker, nu ar fi sigur, asa ca folosesc o alta baza de date identica (e identica deoarece testele ruleaza exact codul din `main.py` si din `db.py`) dar fara sa strice aplicatia. configurarea asta e in `backend/tests/conftest.py`, alternativ poti rula testele astea si inainte sa dai push: porneste mediul virtual si apoi ruleaza `pytest` din root

## CD

Pe `Railway`, gasit in repo la sectiunea `deployments`, avem aplicatia live. ruleaza exact `Docker image`. isi face redeploy dupa ce se ruleaza testele de CI, deci dupa push/PR pe `main`

# explicatii si implementari:

aplicatia e aplicatie web gandita pt telefon, adica pt a o face aplicatie mobila ar trebui rescris frontend ul din `React` in `React Native`. dar laborantul a zis ca e perfect si asa.
food logging flow:
 - frontend: FoodSearch → select food → POST /food-log
 - backend: food_log router → creeaza FoodLogEntry in BD
 - dashboard: GET /food-log → primeste mesele si calculeaza valorile nutritionale
dupa crearea mediului virtual se instaleaza imediat fastapi si ce mai folosim la proiect, ele sunt scrise in `requirements.txt`. când mai adaugam dependinte ele se scriu acolo.
comenzile de `git` se pot rula si din `venv`.
fisierele alea `__init__.py` si `__pycache__` sunt acolo ca sa faca pachete pt python.
daca lucrati la baza de date aveti in vedere `backend/app/models` si `backend/app/db.py` si `backend/app/main.py` pt conectare.
daca aveti nelamuriri despre `frontend` sa stiti ca l a facut `lovable` si pot sa ii mai pun intrebari daca vreti (eu n am mai lucrat cu lovable dupa ce mi a dat codul asta).
in `backend/app/routers` cred ca endpoint ul `health.py` e inutil, doar testam ca merge aplicatia cand a fost prima data creata.
cand modifici `frontend` e necesar sa refaci `dist` inainte sa testezi (altfel vezi acelasi frontend mereu). adica din directorul `frontend` sa rulezi iar `npm run build`.
autentificarea foloseste `JWT token` si `OAuth`.
mesele (sau ingredientele) care se afiseaza pe ecranul de `search/add food` vin dintr un `seed data` care a inserat in BD acele mancaruri la `startup`. merita marita lista de mancaruri cu riscul ca aplicatia va rula mai lent la startup.
exista niste warning uri, le ignoram. unele erori `Pylance` pot fi ignorate.
avem niste console log uri prin cod care sunt inutile
la testare:
 - frontend → build static (dist)
 - backend → FastAPI servește dist-ul
 - un singur port: 8000, un singur server
 - Vite nu e folosit

# workflow zilnic:

```
git checkout main
git pull origin main

git checkout -b nume-noul-branch
pip install -r requirements.txt

# modificari si testari

git add .
git commit -m "descriere ce am facut"
git push origin nume-noul-branch
```

Apoi poti face pull request pe `main`

# tips and tricks

cand ceva nu merge pune `console.log()` dupa fiecare actiune.
cand ceva nu merge poate dura enorm ca AI ul sa si dea seama de eroare, incearca tu sa intelegi codul si sa gasesti problema (de la laborant).