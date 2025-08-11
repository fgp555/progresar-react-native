import { View, Text, ScrollView, StyleSheet } from "react-native";
import React from "react";
import { Link } from "expo-router";

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      <View>
        <Text style={styles.title}>TRANSPASERVIC S.A.S</Text>
        <Text style={styles.subtitle}>Sobre Nosotros</Text>
        <Text style={styles.text}>
          Es una empresa especializada, que brinda servicios en toda COLOMBIA, dedicada al
          sector de Transporte Especial, con excelente calidad en cada paquete ofrecido,
          estamos capacitados para ofrecerles la atención y asesoría profesional oportuna
          a los clientes, donde contamos con recursos necesarios para brindar un servicio
          de calidad.
        </Text>

        <Text style={styles.subtitle}>Nuestra Misión</Text>
        <Text style={styles.text}>
          Ofrecer servicios de transporte vehicular seguros, eficientes y puntuales,
          garantizando la satisfacción de nuestros clientes a través de soluciones
          innovadoras y personalizadas que cubren sus necesidades de movilidad. Nos
          comprometemos a operar con responsabilidad social y ambiental, priorizando la
          seguridad y bienestar tanto de nuestros usuarios como de nuestros colaboradores.
        </Text>

        <Text style={styles.subtitle}>Nuestra Vision</Text>
        <Text style={styles.text}>
          Ser la empresa líder en transporte vehicular, reconocida por su excelencia
          operativa, confiabilidad y compromiso con la sostenibilidad. Queremos ser el
          referente en movilidad, ofreciendo soluciones que impulsen el desarrollo
          económico y la mejora en la calidad de vida de las comunidades donde operamos.
        </Text>

        <Text style={styles.subtitle}>Nuestra Experiencia</Text>
        <Text style={styles.text}>
          + de 15 Años de Experiencia. Nuestra empresa ha consolidado su liderazgo
          brindando servicios de calidad y confiabilidad en el ámbito de viajes y turismo.
          Durante esta década, hemos organizado cientos de experiencias personalizadas,
          atendiendo a miles de clientes satisfechos en destinos nacionales.
        </Text>
        <View style={{ height: 20 }}></View>
        <Text style={styles.text}>
          <Link href="https://www.transpaservic.com/" style={{ color: "#b00" }}>
            www.transpaservic.com
          </Link>
        </Text>
      </View>
      <View style={{ height: 50 }}></View>
      <View>
        <Text style={styles.title}>Systered</Text>
        <Text style={styles.subtitle}>Sobre Nosotros</Text>
        <Text style={styles.text}>
          Somos especialistas en soporte técnico, ofreciendo un servicio rápido y eficaz.
          Brindamos asistencia en servidores, CCTV, computadores y más.
        </Text>

        <Text style={styles.subtitle}>Nuestra Misión</Text>
        <Text style={styles.text}>
          Administramos infraestructura informática y tecnologías de información,
          proporcionando soluciones eficientes y asesoría proactiva para garantizar el
          correcto funcionamiento de su empresa.
        </Text>

        <Text style={styles.subtitle}>¿Por qué elegirnos?</Text>
        <Text style={styles.text}>
          - Personal entrenado y calificado. - Experiencia en áreas críticas y de alta
          disponibilidad. - Amplio surtido de refacciones. - Soporte técnico remoto o en
          sitio. - 12 años de experiencia. - Cobertura a nivel nacional.
        </Text>

        <Text style={styles.subtitle}>Nuestra Experiencia</Text>
        <Text style={styles.text}>
          - 6 Agentes de soporte - 12 Años de experiencia - 1500 Clientes satisfechos
        </Text>
        <View style={{ height: 20 }}></View>
        <Text style={styles.text}>
          <Link href="https://www.systered.com" style={{ color: "#b00" }}>
            www.systered.com
          </Link>
        </Text>
      </View>
      <View style={{ height: 100 }}></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    paddingBottom: 10,
    color: "#b00",
    borderBottomWidth: 1,
    borderBottomColor: "#b00",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 15,
  },
  text: {
    fontSize: 16,
    marginTop: 5,
    color: "#333",
  },
});
