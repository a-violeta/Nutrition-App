pentru a lucra la backend eu mi am facut un mediu virtual pt ca asa e recomandat (ignorati daca nu vreti sa lucrati cu mediu virtual). pt frontend/testare aplicatie nu cred ca trebuie mediu virtual.

# instructiuni mediu virtual:
dupa clonare repo `https://github.com/a-violeta/Nutrition-App`, in terminal (eu am lucrat cu VS Code):
```
cd backend
python -m venv venv
venv\Scripts\activate   # pt Windows sau comanda de jos pt mac
source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```
Ctrl + Shift + P
scrie: "Python: Select Interpreter"
alege: `backend\venv\Scripts\python.exe` pt Windows sau `backend/venv/bin/python` pt mac

# testeaza (optional):

## testare local:
```
uvicorn app.main:app --reload
```
ctrl + c pt a inchide

## testare doar docker fara mediu virtual:
din Nutrition-App ruleaza:
```
docker-compose up --build
```
se inchide cu ctrl + c dar uneori nu merge din prima

# explicatii (optional):
asa se face mediul virtual de lucru venv care trebuie activat mereu când lucram la backend. se instaleaza automat fastapi si ce mai folosim la proiect pt ca sunt scrise in `requirements.txt` si când mai adaugam dependinte ele se pun acolo (stie chat gpt cum sa faca asta).
la testarea locala ar trebui sa spuna `uvicorn running on ...` si daca intrati pe url ul ala ar trebui sa vedeti frontend ul generat de lovable. la testare docker ar trebui sa fie la fel.
comenzile de `git` se pot rula si din `venv`.
in `backend/app/routers` e un endpoint `health.py` definit dar e inutil, cand lovable mi a generat frontend ul l a facut cu react router si fara BrowserRouter apropo. deci unde vedeti in `backend/app/main.py` ca e un endpoint `/{full_path:path}` ala e un fel de endpoint general care serveste frontend ul si odata ce deschizi aplicatia router ul react preia stafeta si doar el mai schimba paginile (apropo, sunt mai multe pagini).
`npm run build` asta trebuie sa va regenereze folderul `dist` din frontend, ala detine `index.html` al aplicatiei apropo

# workflow zilnic:
```
git checkout main
git pull origin main
git checkout -b nume-noul-branch
```

- pt lucru la backend:
	- in folderul backend, in terminal: 
        ```
        venv\Scripts\activate
        ```
	- testare locala backend: 
        ```
        uvicorn app.main:app --reload
        ```
    - sau
	- testare pe tot stack ul, din root ruleaza: 
        ```
        docker-compose up --build
        ```
- pt lucru la frontend:
        - dupa modificarile aduse, din folderul frontend:
        ```
        npm install
        npm run build
        ```
- pt simpla testare:
	- din root, in terminal: 
        ```
        docker-compose up --build
        ```
	- accesare link ul respectiv

```
git add .
git commit -m "descriere ce am facut"
git push origin nume-noul-branch
```
