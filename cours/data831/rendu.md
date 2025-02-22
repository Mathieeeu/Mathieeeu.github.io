# DATA831 - Big Data

## Tutoriel : Déploiement et utilisation d'Hadoop en Java

### Introduction

Nous allons voir comment déployer un cluster Hadoop en utilisant Docker et comment développer un programme de MapReduce en Java pour effectuer des opérations simples sur des fichers (ex: comptage de mots dans un texte).

### Prérequis

Avant de commencer, il est important de s'assurer d'avoir les éléments suivants installés sur votre machine :

- **Git** : pour cloner le dépôt contenant les fichiers nécessaires
- **Docker** : pour lancer des conteneurs
- **Java JDK 8 ou plus** : pour compiler et exécuter du code Java
- **Maven** : pour gérer le projet Java et ses dépendances

### Partie 1 : Déploiemen tdu cluster Hadoop avec Docker

#### Etape 1 : Cloner le dépôt Docker Hadoop

Pour commencer, il faut cloner le dépot Git qui contient les configurations nécessaires pour lancer Hadopp avec Docker. 

```bash
git clone https://github.com/big-data-europe/docker-hadoop
cd docker-hadoop
```

#### Etape 2 : Lancer le cluster Hadoop

Pour déployer un cluster Hadoop, il suffit d'exécuter la commande suivante :

```bash
docker-compose up -d
```

Cette commande initialise plusieurs conteneurs, notamment le _namenode_, qui est le noeud principal du cluster Hadoop et qui permet de gérer les fichiers stockés dans le HDFS (Hadoop Distributed File System). 

On peut s'assurer du bon fonctionnement des conteneurs en cours d'exécution en utilisant la commande `docker ps`.

Il est possible d'arrêter le cluster Hadoop en utilisant la commande suivante :

```bash
docker-compose down
```

#### Etape 3 : Accéder au conteneur Namenode

Comme dit précédemment, le _namenode_ est le coeur du système HDFS. Pour intéragir avec ce conteneur, il faut exécuter la commande suivante :

```bash
docker exec -it namenode bash
```


#### Etape 4 : Configurer le système de fichiers HDFS

Il est possible de vérifier que le système de fichiers HDFS est bien initialisé en utilisant la commande `hdfs dfs -ls /` qui affiche la liste des fichiers à la racine du système de fichiers.

Ensuite, Hadoop nécessite un répertoire utilisateur pour stocker les fichiers. Pour le créer, il suffit d'exécuter la commande suivante :

```bash
hdfs dfs -mkdir -p /user/root
```

### Partie 2 : Préparation des fichiers pour l'analyse

#### Etape 1 : Copier les fichiers à analyser dans le conteneur

Depuis votre machine locale, vous devez copier le fichier texte à analyser et le fichier JAR contenant votre programme MapReduce dans le conteneur _namenode_.

Pour ce faire, vous devez avoir téléchargé les fichiers suivants sur votre machine locale : 
- [rousseauonline-all.txt](https://drive.google.com/file/d/1eKy_d4FlHBX5MYnIXCtqMRdqxOPkj0qY/view?usp=sharing) : le texte à analyser
- [wordcountjava-1.0-SNAPSHOT.jar](https://drive.google.com/file/d/1V2zBl92LMFox5xaYVaVuoxLMxC7SYOYN/view?usp=sharing) : le programme MapReduce que nous allons utiliser dans la suite.

Ici, le programme présent dans le fichier JAR est un programme de comptage de mots **qui prend en compte la ponctuation**.

Ensuite, vous pouvez copier ces fichiers dans le conteneur _namenode_ en utilisant les commandes suivantes depuis la console de votre machine locale :

```bash
docker cp ./rousseauonline-all.txt namenode:/tmp
docker cp ./wordcountjava-1.0-SNAPSHOT.jar namenode:/tmp
```

#### Etape 2 : Copier le fichier texte dans HDFS 

Revenez dans le terminal du conteneur _namenode_ et créez un répertoire `input` dans le système de fichiers HDFS :

```bash
hdfs dfs -mkdir /user/root/input
```

Ensuite, copiez le fichier texte `rousseauonline-all.txt` dans le répertoire `input` du système de fichiers HDFS :

```bash
hdfs dfs -put /tmp/rousseauonline-all.txt /user/root/input
```

#### Etape 3 : Accéder au dashboard Hadoop

Il est possible de surveiller HDFS via un navigateur en accédent à [http://localhost:9870/](http://localhost:9870/).

### Partie 3 : Utilisation du programme MapReduce en Java

#### Etape 1 : Exécution du programme MapReduce sur Hadoop

Pour commencer, **il est essentiel de vider le répertoire de sortie `output` s'il existe** avec la commande suivante :

```bash
hdfs dfs -rm -r /user/root/output
```

Ensuite il est possible de lancer le programme MapReduce sur le fichier texte `rousseauonline-all.txt` en utilisant la commande suivante depuis le conteneur _namenode_ :

```bash
hadoop jar /tmp/wordcountjava-1.0-SNAPSHOT.jar org.apache.hadoop.examples.WordCount /user/root/input/rousseauonline-all.txt /user/root/output
```

Dans cette commande :
- `wordcountjava-1.0-SNAPSHOT.jar` est le fichier JAR contenant le programme MapReduce
- `org.apache.hadoop.examples.WordCount` est la classe principale du programme à exécuter
- `/user/root/input/rousseauonline-all.txt` est le fichier d'entrée à analyser (modifiable selon le fichier que vous avez choisi)
- `/user/root/output` est le répertoire de sortie où les résultats seront stockés (modifiable selon vos besoins)

#### Etape 2 : Récupération et visualisation des résultats

Pour afficher le contenu du répertoire de sortie `output`, il est possible d'utiliser la commande suivante :

```bash
hdfs dfs -ls /user/root/output  
```

Il est donc possible de voir des fichiers comme `part-r-00000` qui contiennent les résultats du programme MapReduce. Pour visualiser le contenu de ces fichiers dans le terminal (_attention, si le fichier est trop volumineux, le résultat peut être difficile à lire dans le terminal_), il est possible d'utiliser la commande suivante :

```bash
hdfs dfs -cat /user/root/output/part-r-00000
```

Pour exporter le contenu du fichier `part-r-00000` dans un fichier texte sur la machine local, il faut :

1. Depuis le conteneur _namenode_, copier le fichier vers le répertoire `/tmp` :
    ```bash
    hdfs dfs -cat /user/root/output/part-r-00000 > /tmp/resultat.txt
    ```

2. Depuis la console de votre machine locale, copier le fichier `resultat.txt` depuis le conteneur vers votre répertoire local :
    ```bash
    docker cp namenode:/tmp/resultat.txt .
    ```

Le fichier `resultat.txt` est maintenant disponible sur votre machine locale pour une analyse plus approfondie.
