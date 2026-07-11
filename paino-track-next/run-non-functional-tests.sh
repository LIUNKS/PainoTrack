#!/usr/bin/env bash

# Colores para salida en consola
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Asegurarse de estar en el directorio del script
cd "$(dirname "$0")"

# Variables de control de estado para el reporte consolidado
T1_STATUS="No ejecutado"
T2_STATUS="No ejecutado"
T3_STATUS="No ejecutado"
T4_STATUS="No ejecutado"

# Funciones de ejecución de pruebas individuales

run_test_1() {
    echo -e "\n${BOLD}======================================================${NC}"
    echo -e "${BOLD}[Prueba 1] Seguridad: Análisis de vulnerabilidades en dependencias (npm audit)${NC}"
    echo -e "======================================================\n"
    npm audit
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "\n${GREEN}✅ [APROBADO] No se encontraron vulnerabilidades críticas o altas.${NC}"
        T1_STATUS="APROBADO"
    else
        echo -e "\n${YELLOW}⚠️  [ADVERTENCIA] Se encontraron vulnerabilidades en las dependencias.${NC}"
        T1_STATUS="ADVERTENCIAS"
    fi
}

run_test_2() {
    echo -e "\n${BOLD}======================================================${NC}"
    echo -e "${BOLD}[Prueba 2] Confiabilidad: Validación del compilador TypeScript (tsc)${NC}"
    echo -e "======================================================\n"
    echo -e "${YELLOW}Iniciando análisis estático de tipado con tsc (esto puede tardar unos segundos)...${NC}\n"
    npx tsc --noEmit --diagnostics
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "\n${GREEN}✅ [APROBADO] El análisis de tipos compiló sin errores.${NC}"
        T2_STATUS="APROBADO"
    else
        echo -e "\n${RED}❌ [FALLIDO] Se encontraron errores de tipo o sintaxis TypeScript.${NC}"
        T2_STATUS="FALLIDO"
    fi
}

run_test_3() {
    echo -e "\n${BOLD}======================================================${NC}"
    echo -e "${BOLD}[Prueba 3] Calidad de Código: Estándares y Linter (ESLint)${NC}"
    echo -e "======================================================\n"
    npm run lint
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "\n${GREEN}✅ [APROBADO] El código cumple con las directivas de ESLint.${NC}"
        T3_STATUS="APROBADO"
    else
        echo -e "\n${RED}❌ [FALLIDO] Se encontraron errores de linter en el código.${NC}"
        T3_STATUS="FALLIDO"
    fi
}

run_test_4() {
    echo -e "\n${BOLD}======================================================${NC}"
    echo -e "${BOLD}[Prueba 4] Seguridad: Escaneo de secretos en duro y configuración segura${NC}"
    echo -e "======================================================\n"
    node scripts/check-secrets.mjs
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "\n${GREEN}✅ [APROBADO] Configuración de .gitignore segura y sin credenciales expuestas.${NC}"
        T4_STATUS="APROBADO"
    else
        echo -e "\n${RED}❌ [FALLIDO] Fuga de credenciales o configuración insegura de .gitignore detectada.${NC}"
        T4_STATUS="FALLIDO"
    fi
}

show_summary() {
    echo -e "\n${BOLD}======================================================${NC}"
    echo -e "${BOLD}       Resumen Consolidado de Pruebas Estáticas       ${NC}"
    echo -e "======================================================"
    
    # Prueba 1
    if [ "$T1_STATUS" = "APROBADO" ]; then
        echo -e "1. Seguridad (Vulnerabilidades npm):   ${GREEN}APROBADO${NC}"
    elif [ "$T1_STATUS" = "ADVERTENCIAS" ]; then
        echo -e "1. Seguridad (Vulnerabilidades npm):   ${YELLOW}ADVERTENCIAS PRESENTES${NC}"
    else
        echo -e "1. Seguridad (Vulnerabilidades npm):   ${BLUE}NO EJECUTADO${NC}"
    fi

    # Prueba 2
    if [ "$T2_STATUS" = "APROBADO" ]; then
        echo -e "2. Confiabilidad (Compilación TS):     ${GREEN}APROBADO${NC}"
    elif [ "$T2_STATUS" = "FALLIDO" ]; then
        echo -e "2. Confiabilidad (Compilación TS):     ${RED}FALLIDO${NC}"
    else
        echo -e "2. Confiabilidad (Compilación TS):     ${BLUE}NO EJECUTADO${NC}"
    fi

    # Prueba 3
    if [ "$T3_STATUS" = "APROBADO" ]; then
        echo -e "3. Calidad de Código (ESLint):         ${GREEN}APROBADO${NC}"
    elif [ "$T3_STATUS" = "FALLIDO" ]; then
        echo -e "3. Calidad de Código (ESLint):         ${RED}FALLIDO${NC}"
    else
        echo -e "3. Calidad de Código (ESLint):         ${BLUE}NO EJECUTADO${NC}"
    fi

    # Prueba 4
    if [ "$T4_STATUS" = "APROBADO" ]; then
        echo -e "4. Seguridad (Escaneo de Secretos):    ${GREEN}APROBADO${NC}"
    elif [ "$T4_STATUS" = "FALLIDO" ]; then
        echo -e "4. Seguridad (Escaneo de Secretos):    ${RED}FALLIDO${NC}"
    else
        echo -e "4. Seguridad (Escaneo de Secretos):    ${BLUE}NO EJECUTADO${NC}"
    fi
    echo -e "${BOLD}======================================================${NC}"
}

show_menu() {
    clear
    echo -e "${BOLD}======================================================${NC}"
    echo -e "${BOLD}      Centro de Pruebas Estáticas No Funcionales      ${NC}"
    echo -e "${BOLD}======================================================${NC}"
    echo -e "Selecciona una opción para ejecutar:"
    echo -e "1) ${BLUE}Prueba 1:${NC} Seguridad de Dependencias (npm audit)"
    echo -e "2) ${BLUE}Prueba 2:${NC} Compilación y Tipado TypeScript (tsc)"
    echo -e "3) ${BLUE}Prueba 3:${NC} Estándares y Buenas Prácticas (ESLint)"
    echo -e "4) ${BLUE}Prueba 4:${NC} Escaneo de Secretos y Configuración (.gitignore)"
    echo -e "5) ${GREEN}Ejecutar las 4 pruebas consecutivas${NC}"
    echo -e "6) Ver Resumen Consolidado actual"
    echo -e "7) Salir"
    echo -e "======================================================"
}

# Bucle principal interactivo
while true; do
    show_menu
    read -p "Ingresa tu opción [1-7]: " opt
    case $opt in
        1)
            run_test_1
            read -p "Presiona [Enter] para volver al menú..."
            ;;
        2)
            run_test_2
            read -p "Presiona [Enter] para volver al menú..."
            ;;
        3)
            run_test_3
            read -p "Presiona [Enter] para volver al menú..."
            ;;
        4)
            run_test_4
            read -p "Presiona [Enter] para volver al menú..."
            ;;
        5)
            echo -e "\n${BOLD}Iniciando ejecución secuencial de las 4 pruebas...${NC}"
            run_test_1
            run_test_2
            run_test_3
            run_test_4
            show_summary
            read -p "Presiona [Enter] para volver al menú..."
            ;;
        6)
            show_summary
            read -p "Presiona [Enter] para volver al menú..."
            ;;
        7)
            echo -e "\n¡Saliendo de la Suite de Pruebas! ¡Hasta luego!\n"
            break
            ;;
        *)
            echo -e "${RED}Opción inválida. Intenta de nuevo.${NC}"
            sleep 1
            ;;
    esac
done
