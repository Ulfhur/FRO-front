## WELCOME TO THE APP FANTASY REALM ONLINE - HERO TAVERN ##
## You'll find anything on this file to know how works and how to deploy this app ##

How to deploy in local machine:

    - First you need to create a Main folder (for example "FantasyRealmOnline") in your local machine (I suggest to create it inside C:/user). You need this folder in purpose to clone backend folder and frontend folder from GitHub.

    - Great ! You've got a brand new folder. Now you need some softwares to make it works: 
        
        - Visual Studio Code : https://code.visualstudio.com/ (This way you'll be able to import Git repositories)
        - XAMPP : https://www.apachefriends.org/fr/index.html (Software needed to manage your future database and acting like a server)
        - Composer : https://getcomposer.org/
        - Symfony CLI : https://symfony.com/download

    - When you've installed both softwares you need to launch XAMPP and set it up (Laucnh Apache server and MySql server)

    - When both servers're running (meaning Apache and MySql have been started and buttons turned green), launch VS Code and open your backend folder (OPEN THE ROOT FOLDER). When you're inside, you need to link your Git account.

    - Now that you have the main folder and all softwares requested let's import backend and frontend with GitHub. You need to be inside the MAIN FOLDER with VS Code, this way when you'll clone repositories you'll have TWO NEW FOLDERS (Backend and Frontend).

    So now how to clone Git Repositories ? That's quit simple, all you need to do is go inside your VS Code terminal and write these two commands :

        `git clone https://github.com/Ulfhur/FRO-back`
        `git clone https://github.com/Ulfhur/FRO-front`

    - Now you have all the code needed ! We're almost done but there is one last important thing to do. Set the backend up !

        To do so, leave the main folder (The one used to clone repositories) and go inside your brand new backend folder.  

        Inside this folder you'll find a very important file called ".env" this is the file where you will set your database URL.

        !! DO NOT WRITE ANYTHING INSIDE IF YOU DO SO ANYONE COULD HAVE ACCESS TO YOUR DATABASE !! 

        You need to create a new file called .env.local, this file will OVERWRITE your .env file but won't be pushed inside Git (So no one can access it anymore).

        Now that you've got your .env.local you need to set your database URL like this : 

        DATABASE_URL="mysql://appName:yourPasswordHere@127.0.0.1:3306/yourDatabaseName?serverVersion=10.11.2-MariaDB&charset=utf8mb4" (With XAMPP the default "appName" is root and if you haven't set any password just leave it empty)

        If you're MySql server runs on another port change it for the right port (127.0.0.1:3306 -> 127.0.0.1:yourPort)

        The last thing to do is to install all the bundles to make the backend running properly, to do so go back to your VS Code terminal and write these command : composer install 
            This command will install every bundles you need. 

        Well well, it's time for you to create your database, quit simple write these two commands in you terminal :

            `php bin/console doctrine:database:create` (This command will create your database)
            `php bin/console doctrine:migrations:migrate` (This command will migrate your database)

    - Time for you to test if you database has been correctly created. First run this command : `symfony server:start`

        When you're server running go back to XAMPP and click on "admin" button inside MySql. If anything right then you should be redirected to PhpMyAdmin and your new database should be there.

    - Let's configure frontend now (Don't wory this is more simple) : 

        Open your Front folder with VS Code, download the VS Code extension called PHP Server. When you've installed this extension go inside "index.html" and launch PHP Server, your browser will open and your Main Page should be there.



                                    CONGRATULATIONS YOUR APP IS NOW RUNNIG !!
