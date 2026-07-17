# Auditoría pedagógica de la Clase 18 posterior a reparación

## 1. Resumen ejecutivo

La Clase 18 fue reparada para cumplir mejor su objetivo central: que el alumno comprenda, diseñe y pruebe un agente híbrido que combina modelos, reglas, estrategias de decisión, explicación y salida estructurada.

Estado actual: **lista para uso en clase**.

La clase ya no presenta los principales problemas detectados en la auditoría previa. Ahora diferencia con mayor claridad:

- qué entrega cada fuente al combinador;
- cuándo elegir Voting, Weighted Voting, Bagging, Boosting, Stacking o no combinar;
- qué se programa por separado en Misión 8 y qué se integra en Misión 9;
- qué partes del código son simuladas y cuáles pueden reemplazarse por modelos reales;
- cómo probar el agente con entradas JSON y salidas esperadas.
- cómo evaluarlo con una rúbrica formal.

La secuencia sigue siendo amplia, pero ahora incluye una ruta corta para impartir la clase si hay poco tiempo. El recorrido pedagógico es legible: primero se entienden especialistas y estrategias, luego se implementan piezas, después se integran en un agente, y finalmente se prueban, evalúan y explican decisiones.

## 2. Objetivo auditado

Objetivo esperado:

> Que el alumno pueda construir mental y técnicamente un agente híbrido capaz de recibir un caso multimodal, validar datos, aplicar reglas, consultar modelos especializados, combinar predicciones, explicar la decisión y devolver una salida estructurada.

Resultado posterior a reparación final: **cumple el objetivo**.

La clase ahora contiene puentes claros entre concepto, decisión, implementación, prueba y evaluación. El alumno tiene más momentos para razonar antes de ejecutar y puede trabajar con un notebook mínimo ejecutable basado en funciones simuladas.

## 3. Reparaciones aplicadas

### 3.1 Contrato de datos entre fuentes y combinador

Se añadió una tabla explícita en Misión 6 con:

- fuente;
- entrada que recibe;
- salida que entrega;
- cómo la usa el combinador.

Esto corrige una debilidad importante: antes el alumno veía especialistas, pero no necesariamente entendía qué objeto concreto le entregaban al agente.

### 3.2 Justificación previa en la selección de estrategia

En Misión 7 se añadió un campo de justificación antes de evaluar la respuesta. El simulador ahora registra la razón del alumno y la incorpora al feedback.

Esto convierte la actividad de “hacer clic y comprobar” en una decisión argumentada.

### 3.3 Ruta única entre Misión 8, Misión 9 y Colab final

Se añadió una advertencia en Misión 8 para explicar que ahí se programan estrategias por separado, en Misión 9 se conectan dentro de `decidir(caso)` y la sección Colab final reúne todo el notebook.

Esto reduce la confusión previa sobre cuál era el notebook real.

### 3.4 Misión 10 corregida

La Misión 10 ahora se enfoca en “cuándo combinar y cuándo detenerse”. La comparación incluye:

- Voting;
- Weighted Voting;
- Bagging;
- Boosting;
- Stacking;
- No combinar.

Ya no compite con Misión 7 ni mezcla fallback como si fuera una estrategia equivalente de ensamble. Ahora separa reglas, fallback y combinación.

### 3.5 Misión 11 reposicionada

La Misión 11 ahora funciona como resumen técnico del agente construido en Misión 9, no como una nueva introducción paralela.

Esto mejora el orden narrativo: el alumno construye primero y después analiza la anatomía del sistema.

### 3.6 Simulador ampliado

El simulador final ahora pide una predicción previa del alumno y permite seleccionar estrategia de combinación. El resultado muestra:

- predicción del alumno;
- decisión final;
- confianza;
- estrategia usada;
- modelos consultados;
- explicación.

Esto conecta mejor el simulador con las estrategias aprendidas.

### 3.7 Diseño con checklist de validación

La sección Diseño ahora incluye una checklist para confirmar que:

- la regla se puede evaluar con datos del caso;
- cada modelo tiene entrada y salida definidas;
- la estrategia coincide con el tipo de salidas;
- la decisión puede explicarse a un usuario no técnico.

Esto ayuda a convertir el diseño propio en una arquitectura verificable.

### 3.8 Código generado y Colab ejecutables

El generador ahora produce un bloque ejecutable con funciones simuladas, pesos, combinación, explicación y `caso_demo`.

La sección Colab incluye un notebook mínimo que corre con `modelo_tabular`, `modelo_texto`, `modelo_cnn`, `combinar_ponderado`, `explicar` y un caso de prueba.

Esto corrige el riesgo de presentar pseudocódigo como si fuera código completo y permite al alumno reemplazar simuladores por modelos reales más adelante.

### 3.9 Casos de prueba enriquecidos

Los cinco casos de prueba ahora muestran:

- entrada JSON;
- salida esperada;
- criterio de validación.

Esto hace que la prueba sea más parecida a una validación real del agente.

### 3.10 Ruta corta y rúbrica formal

Se añadió una ruta corta para impartir la clase cuando el tiempo sea limitado.

También se añadió una rúbrica con seis criterios:

- entrada JSON;
- reglas duras;
- modelos;
- estrategia;
- salida;
- pruebas.

Esto convierte el cierre en una evaluación concreta, no solo en reflexión.

## 4. Evaluación misión por misión

### Misión 1 a Misión 5

Funcionan como base conceptual y visual. Presentan reglas, modelos, datos tabulares, texto e imagen. La carga sigue siendo alta, especialmente por el repaso de CNN, pero es aceptable si las clases previas ya prepararon al alumno.

Mitigación: la clase ahora incluye una ruta corta que permite priorizar las misiones esenciales si el grupo necesita más práctica.

### Misión 6

Ahora cumple mejor su papel de puente entre modelos aislados y agente híbrido. La tabla de contrato de datos deja claro qué información sale de cada especialista.

Estado: **bien resuelta**.

### Misión 7

La selección de estrategias es más pedagógica porque exige justificar antes de evaluar. La tabla y el simulador ahora se complementan mejor.

Estado: **bien resuelta**.

### Misión 8

La misión queda más clara porque se explica que el laboratorio por estrategia no reemplaza la función final. Sigue siendo una sección técnica exigente, pero ahora tiene mejor frontera.

Estado: **funcional**.

### Misión 9

La construcción del agente híbrido se entiende mejor como integración de piezas. La advertencia sobre funciones pendientes evita expectativas falsas de ejecución completa.

Estado: **bien encaminada**.

### Misión 10

La misión fue corregida conceptualmente. Ahora compara estrategias y también explica cuándo no combinar.

Estado: **corregida**.

### Misión 11

Funciona como resumen técnico posterior a la construcción. Ya no introduce otro agente en paralelo.

Estado: **corregida**.

### Misión 12 a Misión 14

Enrutamiento, explicabilidad y no combinar siguen siendo útiles como cierre conceptual. Con los cambios previos, estas misiones ahora se sienten menos redundantes.

Estado: **útiles como consolidación**.

### Simulador, Diseño, Colab, Prueba y Reporte

Las secciones finales ahora conectan mejor con el objetivo central. El simulador pide predicción, el diseño exige validación, el generador entrega código ejecutable con simuladores base, la prueba usa entradas/salidas esperadas y la rúbrica formaliza la evaluación.

Estado: **adecuadas para cierre práctico y evaluación**.

## 5. Hallazgos restantes

### P2 · La clase sigue siendo amplia

La Clase 18 todavía cubre muchas capas: modelos, reglas, CNN, estrategias, Colab, agente, enrutamiento, explicabilidad, diseño, generador, pruebas y reporte.

Mitigación aplicada: se añadió una ruta corta que prioriza Misión 6, Misión 7, Misión 9, Simulador, Colab, Prueba y Rúbrica.

### P3 · Bagging y Boosting son secundarios para este caso

La clase los incluye correctamente en la comparación, pero el caso de agente multimodal favorece más Weighted Voting y Stacking.

Mitigación aplicada: se añadió una nota explícita que los presenta como estrategias para reconocer y comparar, no como primera opción para el caso multimodal de seguros.

### P3 · El notebook sigue siendo didáctico, no productivo

El notebook ahora es ejecutable con modelos simulados, pero no pretende ser un sistema productivo.

Mitigación aplicada: el bloque Colab y el generador ya corren con funciones simuladas y dejan claro que los modelos reales se conectan después.

## 6. Verificación técnica realizada

Se verificó:

- `clase18/clase18.js` sin errores de sintaxis con `node --check`;
- carga local correcta de la página;
- cero errores de consola durante las interacciones probadas;
- existencia del contrato de datos en Misión 6;
- justificación previa y feedback en Misión 7;
- advertencia de ruta única en Misión 8;
- Misión 10 con las seis opciones correctas;
- Misión 11 como resumen técnico;
- simulador con predicción previa y estrategia seleccionable;
- checklist de diseño con cuatro puntos;
- generador con bloque Python ejecutable y funciones simuladas;
- casos de prueba con entrada JSON, salida esperada y criterio;
- rúbrica formal con seis criterios;
- ejecución correcta del Python generado por el generador;
- ejecución correcta del bloque Colab embebido;
- sin overflow horizontal en desktop, tablet y móvil.

## 7. Conclusión

La reparación final cumple el objetivo solicitado. La Clase 18 ahora es más coherente, más honesta con el código que presenta, más ejecutable y más evaluable.

Recomendación final: **puede usarse en clase**. Los únicos cuidados restantes son de gestión de tiempo y profundidad, no de funcionalidad.
