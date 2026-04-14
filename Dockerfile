# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build-env
WORKDIR /src

# Copy solution and project files
COPY SomoniBank.sln ./
COPY Backend/API/API.csproj Backend/API/
COPY Backend/Domain/Domain.csproj Backend/Domain/
COPY Backend/Infrastructure/Infrastructure.csproj Backend/Infrastructure/

# Restore dependencies
RUN dotnet restore Backend/API/API.csproj

# Copy the rest of the backend source code
COPY Backend/ ./Backend/

# Build and publish
WORKDIR /src/Backend/API
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# Copy published files from build stage
COPY --from=build-env /app/publish .

# DataProtection keys storage (if needed, as seen in Program.cs)
RUN mkdir -p /app/App_Data/DataProtectionKeys

# Expose HTTP port
EXPOSE 8080

# Use environment variables for configuration
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "API.dll"]
