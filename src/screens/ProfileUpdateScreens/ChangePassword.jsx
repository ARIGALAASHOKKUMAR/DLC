export const ChangePassword = () => {
  const validationSchema = Yup.object().shape({
    currentPassword: Yup.string().required("Current password is required"),
    newPassword: Yup.string()
      .required("New password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: Yup.string()
      .required("Please confirm your password")
      .oneOf([Yup.ref("newPassword")], "Passwords must match"),
  });

  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: validationSchema,
    onSubmit: handleSubmit,
  });

  async function handleSubmit(values) {
    console.log("Change Password Values:", values);
    // API call here
  }

  return (
    <FormikProvider value={formik}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Change Password</Text>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>Current Password</Text>
          <TextInput
            style={[
              styles.input,
              formik.errors.currentPassword &&
                formik.touched.currentPassword &&
                styles.inputError,
            ]}
            value={formik.values.currentPassword}
            onChangeText={formik.handleChange("currentPassword")}
            onBlur={formik.handleBlur("currentPassword")}
            placeholder="Enter Current Password"
            secureTextEntry
          />
          {formik.errors.currentPassword && formik.touched.currentPassword && (
            <Text style={styles.errorText}>
              {formik.errors.currentPassword}
            </Text>
          )}
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={[
              styles.input,
              formik.errors.newPassword &&
                formik.touched.newPassword &&
                styles.inputError,
            ]}
            value={formik.values.newPassword}
            onChangeText={formik.handleChange("newPassword")}
            onBlur={formik.handleBlur("newPassword")}
            placeholder="Enter New Password"
            secureTextEntry
          />
          {formik.errors.newPassword && formik.touched.newPassword && (
            <Text style={styles.errorText}>{formik.errors.newPassword}</Text>
          )}
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={[
              styles.input,
              formik.errors.confirmPassword &&
                formik.touched.confirmPassword &&
                styles.inputError,
            ]}
            value={formik.values.confirmPassword}
            onChangeText={formik.handleChange("confirmPassword")}
            onBlur={formik.handleBlur("confirmPassword")}
            placeholder="Enter Confirm Password"
            secureTextEntry
          />
          {formik.errors.confirmPassword && formik.touched.confirmPassword && (
            <Text style={styles.errorText}>
              {formik.errors.confirmPassword}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={formik.handleSubmit}
        >
          <Text style={styles.submitButtonText}>SAVE</Text>
        </TouchableOpacity>
      </View>
    </FormikProvider>
  );
};