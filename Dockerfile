FROM node:22-alpine AS frontend-build
WORKDIR /src/Frontend
COPY Frontend/package*.json ./
RUN npm ci
COPY Frontend/ ./
RUN npm run build

FROM nginx:1.27-alpine AS frontend
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /src/Frontend/dist/ /usr/share/nginx/html/
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS api-build
WORKDIR /src
COPY SomoniBank.sln ./
COPY Backend/API/API.csproj Backend/API/
COPY Backend/Domain/Domain.csproj Backend/Domain/
COPY Backend/Infrastructure/Infrastructure.csproj Backend/Infrastructure/
RUN dotnet restore Backend/API/API.csproj
COPY Backend/ ./Backend/
RUN dotnet publish Backend/API/API.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS api
WORKDIR /app
COPY --from=api-build /app/publish ./
EXPOSE 8080
ENTRYPOINT ["dotnet", "API.dll"]
