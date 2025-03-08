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

Il est possible d'arrêter le cluster Hadoop à tout moment en utilisant la commande suivante :

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
- [wordcountjava-1.0-SNAPSHOT.jar](https://drive.google.com/file/d/1uweGJ-zptrhb7qZbFMGPsMPAsnsCNurk/view?usp=sharing) : le programme MapReduce que nous allons utiliser dans la suite.

Ici, le programme présent dans le fichier JAR est un programme de comptage de mots **qui prend en compte la ponctuation**.

Ensuite, vous pouvez copier ces fichiers dans le conteneur _namenode_ en utilisant les commandes suivantes depuis la console de votre machine locale :

```bash
docker cp <lien vers rousseauonline-all.txt> namenode:/tmp
docker cp <lien vers wordcountjava-1.0-SNAPSHOT.jar> namenode:/tmp
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

### Partie 4 : Passage à la taille supérieure

#### Etape 1 : Copier les fichiers à analyser dans HDFS

Téléchargez le jeu de données suivant : 

- [Données de logs (ZIP 17.6MB, 203MB décompressé)](https://drive.google.com/file/d/1AEpBetNGDtjONtWRgt_L8yoQnerro-W2/view?usp=sharing) (source : [Kaggle](https://www.kaggle.com/datasets/vishnu0399/server-logs?select=logfiles.log))

Après décompression, vous obtiendrez le fichier `logfiles.log` qui est celui que nous allons analyser.

L'objectif est d'utiliser une version modifiée du programme de comptage de mots afin de compter la fréquence de connexion des utilisateurs dans les logs. Plus précisément, nous allons compter le nombre de fois que chaque adresse IP, indiquée dans la première colonne (jusqu'au premier espace), apparaît dans le fichier.

Pour ce faire, une version modifiée de la classe `WordCount` appelée `ConnexionCount` a été créée. Voici un extrait de la classe `TokenizerMapper` de cette nouvelle classe :

```java
public static class TokenizerMapper
    extends Mapper<Object, Text, Text, IntWritable> {

    private final static IntWritable one = new IntWritable(1);
    private Text word = new Text();

    public void map(Object key, Text value, Context context) 
        throws IOException, InterruptedException {
        StringTokenizer itr = new StringTokenizer(value.toString());
        if (itr.hasMoreTokens()) {
            String rawToken = itr.nextToken();
            
            // Extraire l'adresse IP (premier token)
            String wordPart = rawToken.split(" ")[0];
            
            // Émettre l'adresse IP si le token n'est pas vide
            if (!wordPart.isEmpty()) {
                word.set(wordPart);
                context.write(word, one);
            }
        }
    }
}
```

Cette classe se trouve déjà dans le fichier JAR `wordcountjava-1.0-SNAPSHOT.jar` que vous aviez téléchargé et copié dans le conteneur _namenode_.

#### Etape 2 : Déploiement et exécution du job MapReduce sur les logs

Suivez les étapes ci-dessous pour déployer et éxécuter la nouvelle version du programme sur les fichiers de logs : 

1. Lancement du cluster Hadoop et démarrage des conteneurs

    ```bash
    cd docker-hadoop
    docker-compose up -d
    ```

2. Depuis votre machine locale, copier le fichier `logfiles.log` dans le conteneur _namenode_

    ```bash
    docker cp <lien vers logfiles.log sur votre machine locale> namenode:/tmp
    ```

    Si ce n'est pas déjà fait, il faut aussi copier le fichier JAR `wordcountjava-1.0-SNAPSHOT.jar` dans le conteneur _namenode_ :

    ```bash
    docker cp <lien vers wordcountjava-1.0-SNAPSHOT.jar sur votre machine locale> namenode:/tmp
    ```

3. Accéder au conteneur _namenode_

    ```bash
    docker exec -it namenode bash
    ```

4. Préparer l'entrée dans HDFS 

    ```bash
    hdfs dfs -mkdir /user/root/input
    hdfs dfs -put /tmp/logfiles.log /user/root/input
    ```

    Vous pouvez vérifier que le fichier a bien été copié en listant le contenu du répertoire `input` :

    ```bash
    hdfs dfs -ls /user/root/input/
    ```

5. Exécuter le programme MapReduce sur les logs

    Avant tout, il est important de vider le répertoire de sortie `output` s'il existe :

    ```bash
    hdfs dfs -rm -r /user/root/output
    ```

    Lancez ensuite le programme en spéficiant la nouvelle classe `ConnexionCount` :

    ```bash
    hadoop jar /tmp/wordcountjava-1.0-SNAPSHOT.jar org.apache.hadoop.examples.ConnexionCount /user/root/input/logfiles.log /user/root/output
    ```

6. Récupérer les résultats

    Affichez désormais le contenu du résultat en redirigeant la sortie vers un fichier dans le conteneur : 

    ```bash
    hdfs dfs -cat /user/root/output/part-r-00000 > /tmp/resultat.txt
    ```

    Ensuite, quittez le conteneur avec la commande `exit` (ou ouvrez un nouveau terminal) et copiez le fichier `resultat.txt` sur votre machine locale :

    ```bash
    cd <votre répertoire de destination>
    docker cp namenode:/tmp/resultat.txt .
    ```

#### Etape 3 : Analyse des résultats

Le fichier `resultat.txt` affiche bien le nombre de fois que chaque adresse IP apparaît dans les logs. Pour cet exemple, nous constatons que : 

- La très très grande majorité (999730 adresses) n'apparaissent qu'**une seule fois** dans les logs
- Un petit nombre (135 adresses) apparaissent **deux fois**
- Aucune adresse IP n'apparaît plus de deux fois

Ce résultat montre que, dans ce jeu de données, la plupart des connexions sont uniques. Cela limite donc fortement l'analyse en termes de fréquences, mais montre que le MapReduce fonctionne correctement même sur des volumes de données plus importants (le fichier de logs est 15 fois plus volumineux que le fichier texte utilisé dans les parties précédentes). Pour des analyses utlérieures, il serait intéressant de travailler sur des jeux de données plus volumineux pour avoir un peu plus de variété dans les résultats obtenus.

### Partie 5 : Passage aux données structurées

Pour cette partie, nous allons travailler sur un jeu de données structurées, à savoir un fichier CSV contenant des informations sur des ventes de produits.

#### Etape 1 : Téléchargement des données

Téléchargez les fichier suivants : 

- [SalesJan2009.csv](https://drive.google.com/file/d/1i0YCvS0v7EVMJAMqKUqotLKb6lEKv8kX/view?usp=sharing)
- [ProductSalesMapReduce-1.0-SNAPSHOT.jar](https://drive.google.com/file/d/1L88cXR3QJrm1FxlpcSkjGp_HOYaYC0q7/view?usp=sharing)

Le fichier `SalesJan2009.csv` contient des informations sur des ventes de produits et le fichier JAR `ProductSalesMapReduce-1.0-SNAPSHOT.jar` contient le programme MapReduce que nous allons utiliser pour analyser ces données.

Ce programme est basé sur du code disponible [ici](https://www.guru99.com/create-your-first-hadoop-program.html).

#### Etape 2 : Préparation des fichiers pour l'analyse

Tout d'abord, démarrez le cluster Hadoop en utilisant la commande `docker-compose up -d`.

1. Copiez les fichiers `SalesJan2009.csv` et `ProductSalesPerCountry.jar` dans le conteneur _namenode_ :

    ```bash
    docker cp <lien vers SalesJan2009.csv> namenode:/tmp
    docker cp <lien vers ProductSalesPerCountry.jar> namenode:/tmp
    ```

2. Accédez au conteneur _namenode_ :

    ```bash
    docker exec -it namenode bash
    ```

3. Créez un répertoire `input` (si ce n'est pas déjà fait) et copiez le fichier `SalesJan2009.csv` dans ce répertoire :

    ```bash
    hdfs dfs -mkdir /user/root/input
    hdfs dfs -put /tmp/SalesJan2009.csv /user/root/input
    hdfs dfs -ls /user/root/input # pour vérifier que le fichier est bien là
    ```

#### Etape 3 : Exécution du programme MapReduce

Maintenant, lancez le programme MapReduce pour compter le nombre de ventes par pays, en pensant à vider le répertoire de sortie `output` s'il existe avant de lancer le programme :

```bash
hdfs dfs -rm -r /user/root/output
```

```bash
hadoop jar /tmp/ProductSalesMapReduce-1.0-SNAPSHOT.jar SalesCountry.SalesCountryDriver /user/root/input/SalesJan2009.csv /output
```

Si ça a marché, on peut afficher les résultats dans un fichier texte en utilisant les commandes suivantes :

```bash
hdfs dfs -cat /output/part-00000 > /tmp/resultat_sales.txt
```

puis copier le fichier `resultat_sales.txt` sur votre machine locale (après avoir quitté le conteneur avec `exit` puis `cd <votre répertoire de destination>`): :

```bash
docker cp namenode:/tmp/resultat_sales.txt .
```

On peut maintenant analyser le fichier `resultat_sales.txt` pour voir le nombre de ventes par pays.

On peut par exemple voir que les Etats-Unis sont le pays avec le plus de ventes (462), suivi par le Royaume-Uni (100) et le Canada (76). Il serait maintenant possible d'aller plus loin en analysant les ventes par produit, par mois, etc. et en utilisant des outils de visualisation pour représenter les données.

### Conclusion

Ce tutoriel a permis de voir comment déployer un cluster Hadoop en utilisant Docker et comment utiliseer un programme de MapReduce en Java pour effectuer des opérations simples sur des fichiers (un peu) volumineux. Nous avons pu voir comment compter les mots dans un texte, analyser des logs et travailler sur des données structurées simples.

Il est possible d'aller plus loin en travaillant sur des jeux de données plus volumineux et en utilisant des outils de visualisation pour afficher les résultats de manière plus intuitive à partir des fichiers texte générés.

### Références

- [Setting up hadoop with docker](https://medium.com/@guillermovc/setting-up-hadoop-with-docker-and-using-mapreduce-framework-c1cd125d4f7b)
- [Développer des programmes MapReduce Java pour Apache Hadoop sur HDInsight](https://learn.microsoft.com/fr-fr/azure/hdinsight/hadoop/apache-hadoop-develop-deploy-java-mapreduce-linux)
- [Données de logs Kaggle](https://www.kaggle.com/datasets/vishnu0399/server-logs?select=logfiles.log)
- [Hadoop & Mapreduce examples : first program in java](https://www.guru99.com/create-your-first-hadoop-program.html)
