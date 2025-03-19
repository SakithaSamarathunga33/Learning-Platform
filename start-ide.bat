@echo off
echo =================================
echo    STARTING FULL APPLICATION
echo =================================
echo.

:: Check if concurrently is installed, if not install it
where concurrently >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Installing concurrently package...
    npm install -g concurrently
)

:: Use concurrently to run both applications in the same terminal
echo Starting both services...
echo.
echo Server will be available at: http://localhost:8080
echo Frontend will be available at: http://localhost:3030
echo.
echo Press Ctrl+C to stop all services
echo.

:: Run both applications with nice labels and different colors
concurrently --kill-others --names "SERVER,FRONTEND" --prefix-colors "blue.bold,green.bold" --prefix "[{name}]" "cd server && mvn spring-boot:run" "cd frontend && npm run dev" 