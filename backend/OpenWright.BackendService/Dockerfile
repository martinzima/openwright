FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["OpenWright.BackendService/OpenWright.BackendService.csproj", "OpenWright.BackendService/"]
RUN dotnet restore "OpenWright.BackendService/OpenWright.BackendService.csproj"
COPY . .
WORKDIR "/src/OpenWright.BackendService"
RUN dotnet build "OpenWright.BackendService.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "OpenWright.BackendService.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "OpenWright.BackendService.dll"]
