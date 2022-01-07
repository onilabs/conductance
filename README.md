

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

For local code repository:

    cd conductance
    docker-compose -f ./docker-compose.test.yml up --build

Or, for a built image with tag 'TAG':

    docker run --rm -t --entrypoint /bin/bash onilabs/conductance:TAG
      -c "/usr/src/conductance/node_modules/stratifiedjs/test/run && 
          /use/src/conductance/test/run"

### Running clientside testsuite:

In stratifiedjs/test dir:
    
    conductance serve

    Then open localhost:7071/test/run.html in browser

In conductance/test dir:

   conductance serve run.mho

   Then open localhost:7078/test/run.html in browser
