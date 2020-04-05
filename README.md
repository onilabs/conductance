

              O N I   C O N D U C T A N C E  
                                             
             | \____/ |          ___     ___ 
            |          |        |_  |   |  _|
           |  ( )  ( )  |         | |   | |  
          /|            |\       / /    \  \ 
         |/|            |\|      | |     | | 
            |          |         \ \_____/ / 
            (___----___)          \_______/  
                                             
                  https://conductance.io


* See https://hub.docker.com/r/onilabs/conductance for builds
* See CHANGELOG.md for version info

### Building locally:

    cd conductance
    docker build -t onilabs/conductance:local .

### Running testsuite:

    cd conductance
    docker-compose -f ./docker-compose.test.yml up --build


