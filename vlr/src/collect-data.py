import pandas as pd
from bs4 import BeautifulSoup
import requests
import os

# Liste des URLs à traiter
from data.urls import urls
from tqdm import tqdm

# Initialiser une liste pour stocker toutes les données
all_data = []
filename = 'data/raw_data.csv'
take_new_data = True # Mettre à True pour récupérer les nouvelles données

if not take_new_data:
    # On utilise les données sauvegardées pour éviter de faire trop de requêtes
    # Charger le fichier CSV contenant les données brutes
    df = pd.read_csv(filename)
    all_data = df.values.tolist()
    print(f"Données brutes chargées depuis {filename}.")
else:
    # Parcourir chaque URL
    for url in tqdm(urls, desc="Traitement des événements", unit="evnt"):
        # print(f"Traitement de l'évenement : {url}")
        # Récupérer le contenu de la page
        response = requests.get(url)
        html_content = response.content

        # Analyser le contenu HTML
        soup = BeautifulSoup(html_content, 'html.parser')

        # Extraire les données du tableau
        for row in soup.select('tbody tr'):
            try:
                cols = row.find_all('td')
                player = cols[0].text.strip().split('\n')[0]
                team = cols[0].text.strip().split('\n')[1]
                stats = [col.text.strip() for col in cols[2:]]
                selected_stats = [
                    player,  # Player name
                    team,  # Team code
                    stats[0],  # Rnd
                    stats[14],  # K
                    stats[15],  # D
                    stats[16],  # A
                    stats[17],  # FK
                    stats[18],  # FD
                    stats[12].split('/')[0] if '/' in stats[12] else 0,
                    stats[12].split('/')[1] if '/' in stats[12] else 0,
                    stats[13],  # KMax
                    stats[1], # Rating
                    stats[2],  # ACS
                    stats[5],  # ADR
                    float(stats[4].strip('%')) / 100, # KAST% (% en float)
                    float(stats[10].strip('%')) / 100 # HS% (% en float)
                ]
                all_data.append(selected_stats)
            except Exception as e:
                print(f"\nErreur lors de l'extraction des données : {e}")
                continue

    # Définir les colonnes
    columns = [
        "Player", "Team", "Rnd", "K", "D", "A", "FK", "FD", "CL", "LastAlive", "KMax", "Rating", "ACS", "ADR", "KAST", "HS%"
    ]

    # Sauvegarder all_data dans un fichier CSV (pour l'utiliser hors connexion)
    if os.path.exists(filename):
        os.remove(filename)
    pd.DataFrame(all_data, columns=columns).to_csv(filename, index=False)
    print(f"Données brutes collectées et enregistrées dans {filename}.")

# Définir les colonnes
columns = [
    "Player", "Team", "Rnd", "K", "D", "A", "FK", "FD", "CL", "LastAlive", "KMax", "Rating", "ACS", "ADR", "KAST", "HS%"
]

# Créer un DataFrame
df = pd.DataFrame(all_data, columns=columns)

# Convertir les colonnes numériques au format approprié
numeric_columns = ["Rnd", "K", "D", "A", "FK", "FD", "CL", "LastAlive", "KMax"]
df[numeric_columns] = df[numeric_columns].apply(pd.to_numeric)

# Regrouper les données par joueur et par équipe
grouped = df.groupby([df['Player'].str.lower(), df['Team']]).agg({
    'Rnd': 'sum',
    'K': 'sum',
    'D': 'sum',
    'A': 'sum',
    'FK': 'sum',
    'FD': 'sum',
    'CL': 'sum',
    'LastAlive': 'sum',
    'KMax': 'max',
    'Rating': lambda x: (x.astype(float) * df.loc[x.index, 'Rnd']).sum() / df.loc[x.index, 'Rnd'].sum(),
    'ACS': lambda x: (x.astype(float) * df.loc[x.index, 'Rnd']).sum() / df.loc[x.index, 'Rnd'].sum(),
    'ADR': lambda x: (x.astype(float) * df.loc[x.index, 'Rnd']).sum() / df.loc[x.index, 'Rnd'].sum(),
    'KAST': lambda x: (x.astype(float) * df.loc[x.index, 'Rnd']).sum() / df.loc[x.index, 'Rnd'].sum(),
    'HS%': lambda x: (x.astype(float) * df.loc[x.index, 'Rnd']).sum() / df.loc[x.index, 'Rnd'].sum()
}).reset_index()

# Calcul des KD, KDA, KPR, DPR, APR, FKPR, FDPR, CLPR, LastAlivePR
grouped['KD'] = grouped['K'] / grouped['D']
grouped['KDA'] = (grouped['K'] + grouped['A']) / grouped['D']
grouped['KPR'] = grouped['K'] / grouped['Rnd']
grouped['DPR'] = grouped['D'] / grouped['Rnd']
grouped['APR'] = grouped['A'] / grouped['Rnd']
grouped['FKPR'] = grouped['FK'] / grouped['Rnd']
grouped['FDPR'] = grouped['FD'] / grouped['Rnd']
grouped['CLPR'] = grouped['CL'] / grouped['Rnd']
grouped['LastAlivePR'] = grouped['LastAlive'] / grouped['Rnd']
grouped['CL%'] = grouped['CL'] / grouped['LastAlive']

# Calcul de colonnes particulières
grouped['BaitScore'] = grouped['KD'] * grouped['LastAlivePR'] / grouped['APR']

# Arrondir toutes les colonnes calculées à 2 décimales (Rating, ACS, ADR, KAST, HS%, KD, KDA, KPR, DPR, APR, FKPR, FDPR, CLPR, LastAlivePR)
for col in ['Rating', 'ACS', 'ADR', 'KAST', 'HS%', 'KD', 'KDA', 'KPR', 'DPR', 'APR', 'FKPR', 'FDPR', 'CLPR', 'LastAlivePR', 'CL%', 'BaitScore']:
    grouped[col] = grouped[col].round(2)

# Enregistrer le DataFrame au format CSV et supprimer le précedent fichier s'il existe
filename = 'data/data.csv'
if os.path.exists(filename):
    os.remove(filename)
grouped.to_csv(filename, index=False)
print(f"Données collectées, fusionnées et enregistrées dans {filename}.")

# Affichage de données
    # 10 plus gros nombre de rounds joués
print("10 plus gros nombre de rounds joués :")
print(grouped.nlargest(10, 'Rnd')[['Player', 'Team', 'Rnd']])
