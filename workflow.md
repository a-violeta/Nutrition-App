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

## testare backend local:
```
uvicorn app.main:app --reload
```
ctrl + c pt a inchide

## testare doar docker fara mediu virtual:
din Nutrition-App deschide folderul docker
```
cd docker
docker-compose up --build
```
se inchide cu ctrl + c dar uneori nu merge din prima

# explicatii (optional):
asa se face mediul virtual de lucru venv care trebuie activat mereu când lucram la backend. se instaleaza automat fastapi si ce mai folosim la proiect pt ca sunt scrise in `requirements.txt` si când mai adaugam dependinte ele se pun acolo (stie chat gpt cum sa faca asta). la testarea locala ar trebui sa spuna `uvicorn running on ...` si daca intrati pe url ul ala momentan spune not found pt ca nu avem endpointul ala, daca adaugati `/health` trebuie sa spuna status ok. la testare docker ar trebui ca `http://localhost:8000/health` sa afiseze un json cu status: ok. comenzile de `git` se pot rula si din `venv`

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
	- testare pe tot stack ul, din folderul docker ruleaza: 
        ```
        docker-compose up --build
        ```
- pt lucru la frontend sau testare:
	- din folderul docker, in terminal: 
        ```
        docker-compose up --build
        ```
	- accesare link ul respectiv

```
git add .
git commit -m "descriere ce am facut"
git push origin nume-noul-branch
```
