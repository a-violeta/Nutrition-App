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
din root:
```
cd backend
uvicorn app.main:app --reload
```

si in alt terminal, tot din root, in timp ce uvicorn inca ruleaza in celalalt:
```
cd frontend
npm install
npm run dev
```
deschizi link ul din terminalul frontend, ala cu portul 8080 parca
(pt a inchide, ctrl + c in ambele terminale)

## testare din docker, fara mediu virtual:
din Nutrition-App (root) ruleaza:
```
docker-compose up --build
```
deschide link ul ala, parca era cu portul 8000
(comanda din terminal se inchide cu ctrl + c dar uneori nu merge din prima)

# am facut autentificarea

merge testata si local si in docker (dar local daca nu aveti configuratiile mele atunci nu merge fara sa modificati fisierele)

Instalezi PostgreSQL 15 de aici:
https://www.postgresql.org/download/windows/

În timpul instalării:
```
user: postgres
password: postgres
database name: nutritrack
port: 5433
```
sa va faceti local baza de date `nutritrack` (deschideti pgAdmin sau ce aveti si va conectati cu userul si faceti o baza de date cu numele ala, goala chiar)
asa am configurat eu, daca faceti altfel atunci modificati `backend/app/db.py` si poate mai sunt si altele de modificat, `docker/docker-compose.yml`. dar e mai greu daca modificam fiecare fisierele astea ca sa lucram local

# explicatii (optional, eventual ii trimiteti lui chat gpt daca aveti erori dubioase):
asa se face mediul virtual de lucru venv care trebuie activat mereu când lucram la backend. se instaleaza automat fastapi si ce mai folosim la proiect pt ca sunt scrise in `requirements.txt` si când mai adaugam dependinte ele se pun acolo (stie chat gpt cum sa faca asta).
la testarea locala ar trebui sa spuna `uvicorn running on ...` in terminalul backend si in terminalul frontend ar trebui sa arate mai multe url uri. daca intrati pe primul url ar trebui sa vedeti frontend ul generat de lovable. la testare in docker ar trebui sa mearga la fel.
in `frontend` avem: `dist` care e ceea ce serveste backend ul cand rulam in docker (are html ul), `src` are `components` care sunt configuratii pt diverse componente, pt ecranul de autentificare, dashboard etc. tot in `src` avem si `data/mock-data.ts` pt ca n am pus mancarea in bd inca, `App.tsx` are rutele si in rest sunt chestii de care nu m am atins.
comenzile de `git` se pot rula si din `venv`.
fisierele alea `__init__.py` si `__pycache__` sunt acolo ca sa faca pachete pt python cred.
daca lucrati la baza de date aveti in vedere `backend/app/models` si `backend/app/db.py` si `backend/app/main.py` pt conectare.
daca lucrati la frontend e cam naspa pt ca doar eu am conversatia cu `lovable` despre frontend.
in `backend/app/routers` e un endpoint `health.py` definit dar e inutil, doar testam ca merge.
cand lovable mi a generat frontend ul nu mi a mai facut rute (ar fi trebuit sa fie in `frontend/src/App.tsx`), tot ce se afiseaza e in `frontend/src/pages/Index.tsx` si in functie de niste parametrii se afiseaza dashboard, profil, search etc.
in `backend/app/main.py` se verifica daca ruleaza in docker sau local si configureaza niste chestii pt fiecare varianta. erorile sunt de la pylance cred, aplicatia merge, pylance e prost. pe varianta `running in docker` e un endpoint `/{full_path:path}` ala e un fel de endpoint general care serveste frontend ul si evident nu poti schimba paginile aplicatiei prin ruta.
`npm run build` asta trebuie sa va regenereze folderul `dist` din frontend, ala detine `Index.html` al aplicatiei apropo

## despre testari
mi a fost foarte greu sa fac aplicatia sa mearga si testata local si in docker, dar chiar trebuie sa mearga si local si in docker aparent.

Mod LOCAL (dev)
frontend → rulează cu Vite pe 8080
backend → rulează cu FastAPI pe 8000
CORS activ pt 8080
dezvoltare rapidă
sa aveti baza de date locala ca sa mearga

Mod DOCKER (productie)
frontend → build static (dist)
backend → servește dist-ul
un singur port: 8000
fără CORS, fără Vite, fără 8080


# workflow zilnic:
```
git checkout main
git pull origin main
git checkout -b nume-noul-branch
cd backend
pip install -r requirements.txt
// modifcari si testari
git add .
git commit -m "descriere ce am facut"
git push origin nume-noul-branch
```
