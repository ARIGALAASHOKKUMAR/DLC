export const Help = () => {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Help / సహాయం</Text>

      <View style={styles.helpBox}>
        <Text style={styles.helpText}>
          Email / ఇమెయిల్: support@example.com
        </Text>
        <Text style={styles.helpText}>Phone / ఫోన్: +91 9999999999</Text>
        <Text style={styles.helpText}>
          For profile update issues, contact support team. / ప్రొఫైల్ అప్డేట్
          సమస్యల కోసం, సపోర్ట్ టీమ్ను సంప్రదించండి.
        </Text>
      </View>
    </View>
  );
};