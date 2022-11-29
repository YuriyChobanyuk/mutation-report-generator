# Action generates mutation html report

This action consumes StrykerOutput folder placed in the root and aggregates results of mutation
testing into a single report.html file. (Which later can be published or exposed as an artifact)

## Usage details

To run mutation testing on your projects you need to have two things:
1. Dockerfile, witch should run dotnet-stryker and generate StrykerOutput directory.
2. Github workflow (we recommend having a separate workflow - mutation testing may take a lot of resources)

### Example dockerfile
```
FROM <You_image_with_dotnet_sdk_and_nodejs>
ENV PROJECT=<Project.Name>
ENV TEST_PROJECTS="Biz Api"
ENV TEST_FOLDER="tests"

WORKDIR /src

# Copy project files and restore
COPY ["${PROJECT}.sln", "${PROJECT}.sln"]
COPY src/**/*.csproj ./
RUN for file in $(ls *.csproj); do mkdir -p src/${file%.*}/ && mv $file src/${file%.*}/; done
COPY tests/**/*.csproj ./
RUN for file in $(ls *.csproj); do mkdir -p tests/${file%.*}/ && mv $file tests/${file%.*}/; done

RUN dotnet restore "${PROJECT}.sln" \
--source https://api.nuget.org/v3/index.json \

WORKDIR /

# Copy files
COPY . .

# Run mutation testing
RUN dotnet tool install --global dotnet-stryker --version 3.2.0

RUN cd "$TEST_FOLDER/$PROJECT.Test.Unit" && \
for testProject in $TEST_PROJECTS; \
do dotnet stryker -p "$PROJECT.$testProject.csproj" -r "json"; done

# Throw out mutation testing output
RUN cp -r "$TEST_FOLDER/$PROJECT.Test.Unit/StrykerOutput" "./"

```
