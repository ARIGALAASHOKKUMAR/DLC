import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASICPROFILE, commonAPICall } from "../../utils/utils";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { styles } from "./styles";

export const BasicDetails = ({ userData, onUpdateSuccess }) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.LoginReducer);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());

  const employerTypes = [
    { id: 1, label: "Individual / వ్యక్తిగత" },
    { id: 2, label: "Contractor / కాంట్రాక్టర్" },
    { id: 3, label: "Company / కంపెనీ" },
    { id: 4, label: "Agency / ఏజెన్సీ" },
  ];

  // Helper function to safely parse date string
  const parseDateString = (dateStr) => {
    if (!dateStr) return null;
    
    const parts = dateStr.split("-");
    if (parts.length !== 3) return null;
    
    let day, month, year;
    
    if (parts[0].length === 4) {
      [year, month, day] = parts;
    } else {
      [day, month, year] = parts;
    }
    
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10) - 1;
    const dayNum = parseInt(day, 10);
    
    if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum)) return null;
    
    return new Date(yearNum, monthNum, dayNum);
  };

  // Create date from string for picker
  const getDateForPicker = (dateStr) => {
    if (!dateStr) {
      return new Date(2000, 0, 1);
    }
    
    const parts = dateStr.split("-");
    if (parts.length !== 3) return new Date(2000, 0, 1);
    
    let day, month, year;
    if (parts[0].length === 4) {
      [year, month, day] = parts;
    } else {
      [day, month, year] = parts;
    }
    
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10) - 1;
    const dayNum = parseInt(day, 10);
    
    if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum)) {
      return new Date(2000, 0, 1);
    }
    
    return new Date(yearNum, monthNum, dayNum);
  };

  // Format date for API (YYYY-MM-DD)
  const formatDateForAPI = (date) => {
    if (!date) return "";
    
    const parts = date.split("-");
    if (parts.length !== 3) return date;
    
    let day, month, year;
    
    if (parts[0].length === 4) {
      [year, month, day] = parts;
    } else {
      [day, month, year] = parts;
    }
    
    day = day.padStart(2, "0");
    month = month.padStart(2, "0");
    
    return `${year}-${month}-${day}`;
  };

  // Format date for display (DD-MM-YYYY)
  const formatDateForDisplay = (date) => {
    if (!date) return "";
    
    const parts = date.split(/[-/]/);
    if (parts.length !== 3) return date;
    
    let day, month, year;
    
    if (parts[0].length === 4) {
      [year, month, day] = parts;
    } else {
      [day, month, year] = parts;
    }
    
    return `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`;
  };

  // Format initial date from API
  const formatInitialDate = (dateStr) => {
    if (!dateStr) return "";
    
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split("-");
      return `${day}-${month}-${year}`;
    }
    return dateStr;
  };

  const validationSchema = Yup.object().shape({
    fullName: Yup.string().required("Required / అవసరం"),
    mobileNumber: Yup.string()
      .required("Required / అవసరం")
      .matches(/^[0-9]{10}$/, "Invalid mobile number / చెల్లని మొబైల్ నంబర్"),
    dateOfBirth: Yup.string()
      .required("Required / అవసరం")
      .test(
        "age-18",
        "You must be at least 18 years old / మీరు కనీసం 18 సంవత్సరాలు ఉండాలి",
        function (value) {
          if (!value) return false;

          const parsedDate = parseDateString(value);
          if (!parsedDate) return false;

          const today = new Date();
          const birthDate = new Date(parsedDate);
          
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();

          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }

          return age >= 18;
        }
      ),
    gender: Yup.string().required("Required / అవసరం"),
    employerTypeId: Yup.string().when([], {
      is: () => state.roleName === "DLC Employer",
      then: (schema) => schema.required("Required / అవసరం"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      fullName: userData?.full_name || "",
      dateOfBirth: userData?.date_of_birth ? formatInitialDate(userData.date_of_birth) : "",
      gender: userData?.gender || "",
      mobileNumber: userData?.mobile_number || "",
      email: userData?.email || "",
      profileImage: userData?.profile_image || "base64imageorURL",
      userType: state.roleName,
      stageName: "BASIC_INFO",
      employerTypeId: userData?.employer_type_id
        ? String(userData.employer_type_id)
        : "",
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  async function handleSubmit(values, { setSubmitting }) {
    try {
      const payload = {
        ...values,
        dateOfBirth: formatDateForAPI(values.dateOfBirth),
        employerTypeId: values.employerTypeId
          ? Number(values.employerTypeId)
          : "",
      };

      const response = await commonAPICall(
        BASICPROFILE,
        payload,
        "POST",
        dispatch,
      );

      if (response?.status === 200) {
        onUpdateSuccess?.();
      }
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setSubmitting(false);
    }
  }

  const showEmployerType = state.roleName === "DLC Employer";

  // Handle date selection
  const handleDateChange = (event, selectedDate) => {
    // For Android, when user cancels, selectedDate is null
    if (selectedDate === undefined || selectedDate === null) {
      setShowDatePicker(false);
      return;
    }

    setShowDatePicker(false);
    
    // Extract date components
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    
    const formatted = `${day}-${month}-${year}`;
    formik.setFieldValue("dateOfBirth", formatted);
    formik.setFieldTouched("dateOfBirth", true);
  };

  // Handle date dismiss
  const handleDateDismiss = () => {
    setShowDatePicker(false);
  };

  // Open date picker
  const openDatePicker = () => {
    const date = getDateForPicker(formik.values.dateOfBirth);
    setPickerDate(date);
    formik.setFieldTouched("dateOfBirth", true);
    setShowDatePicker(true);
  };

  // Create minDate for picker (set to year 1900 to allow dates before 1970)
  const getMinDate = () => {
    // Set min date to Jan 1, 1900 (or any year before 1970)
    // This fixes the Android bug where dates before 1970 are not selectable
    const minDate = new Date();
    minDate.setFullYear(1900, 0, 1);
    minDate.setHours(0, 0, 0, 0);
    return minDate;
  };

  return (
    <FormikProvider value={formik}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Basic Details / ప్రాథమిక వివరాలు
          </Text>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Full Name / పూర్తి పేరు <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                formik.errors.fullName &&
                  formik.touched.fullName &&
                  styles.inputError,
              ]}
              value={formik.values.fullName}
              onChangeText={formik.handleChange("fullName")}
              onBlur={formik.handleBlur("fullName")}
              placeholder="Enter full name / పూర్తి పేరు నమోదు చేయండి"
            />
            {formik.errors.fullName && formik.touched.fullName && (
              <Text style={styles.errorText}>{formik.errors.fullName}</Text>
            )}
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Date of Birth / పుట్టిన తేదీ{" "}
              <Text style={styles.requiredStar}>*</Text>
            </Text>

            <TouchableOpacity
              style={[
                styles.datePickerButton,
                {
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                },
                formik.errors.dateOfBirth &&
                  formik.touched.dateOfBirth && {
                    borderColor: "red",
                  },
              ]}
              onPress={openDatePicker}
            >
              <Text style={formik.values.dateOfBirth ? styles.dateText : styles.placeholderText}>
                {formik.values.dateOfBirth 
                  ? formatDateForDisplay(formik.values.dateOfBirth)
                  : "Select Date of Birth / పుట్టిన తేదీని ఎంచుకోండి"}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>

            {formik.errors.dateOfBirth && formik.touched.dateOfBirth && (
              <Text style={styles.errorText}>{formik.errors.dateOfBirth}</Text>
            )}

            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={pickerDate}
                mode="date"
                display="default"
                maximumDate={new Date()}
                minimumDate={getMinDate()} // CRITICAL: This fixes the 1970 issue
                onChange={handleDateChange}
                onDismiss={handleDateDismiss}
                neutralButtonLabel="Cancel"
              />
            )}
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Gender / లింగం <Text style={styles.requiredStar}>*</Text>
            </Text>

            <View style={styles.radioRow}>
              {["MALE", "FEMALE", "OTHER"].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={styles.radioItem}
                  onPress={() => {
                    formik.setFieldTouched("gender", true);
                    formik.setFieldValue("gender", g);
                  }}
                >
                  <Ionicons
                    name={
                      formik.values.gender === g
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={22}
                    color={formik.values.gender === g ? "#007AFF" : "#666"}
                  />
                  <Text style={styles.radioLabel}>
                    {g === "MALE"
                      ? "MALE / పురుషుడు"
                      : g === "FEMALE"
                      ? "FEMALE / స్త్రీ"
                      : "OTHER / ఇతర"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {formik.errors.gender && formik.touched.gender && (
              <Text style={styles.errorText}>{formik.errors.gender}</Text>
            )}
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Mobile Number / మొబైల్ నంబర్{" "}
              <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                formik.errors.mobileNumber &&
                  formik.touched.mobileNumber &&
                  styles.inputError,
              ]}
              value={formik.values.mobileNumber}
              onChangeText={formik.handleChange("mobileNumber")}
              onBlur={formik.handleBlur("mobileNumber")}
              keyboardType="phone-pad"
              placeholder="Enter mobile number / మొబైల్ నంబర్ నమోదు చేయండి"
              maxLength={10}
            />
            {formik.errors.mobileNumber && formik.touched.mobileNumber && (
              <Text style={styles.errorText}>{formik.errors.mobileNumber}</Text>
            )}
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Email / ఇమెయిల్
            </Text>
            <TextInput
              style={[
                styles.input,
                formik.errors.email &&
                  formik.touched.email &&
                  styles.inputError,
              ]}
              value={formik.values.email}
              onChangeText={formik.handleChange("email")}
              onBlur={formik.handleBlur("email")}
              placeholder="Enter email / ఇమెయిల్ నమోదు చేయండి"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {formik.errors.email && formik.touched.email && (
              <Text style={styles.errorText}>{formik.errors.email}</Text>
            )}
          </View>

          {showEmployerType && (
            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                Employer Type / యజమాని రకం{" "}
                <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.selectBox,
                  formik.errors.employerTypeId &&
                    formik.touched.employerTypeId &&
                    styles.inputError,
                ]}
              >
                <Picker
                  selectedValue={formik.values.employerTypeId}
                  onValueChange={(itemValue) => {
                    formik.setFieldTouched("employerTypeId", true);
                    formik.setFieldValue("employerTypeId", String(itemValue));
                  }}
                  style={styles.picker}
                >
                  <Picker.Item
                    label="Select Employer Type / యజమాని రకాన్ని ఎంచుకోండి"
                    value=""
                  />
                  {employerTypes.map((type) => (
                    <Picker.Item
                      key={type.id}
                      label={type.label}
                      value={String(type.id)}
                    />
                  ))}
                </Picker>
              </View>
              {formik.errors.employerTypeId &&
                formik.touched.employerTypeId && (
                  <Text style={styles.errorText}>
                    {formik.errors.employerTypeId}
                  </Text>
                )}
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, formik.isSubmitting && styles.disabledButton]}
            onPress={formik.handleSubmit}
            disabled={formik.isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {formik.isSubmitting
                ? "UPDATING... / అప్డేట్ చేస్తోంది..."
                : "UPDATE PROFILE / ప్రొఫైల్ అప్డేట్ చేయండి"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </FormikProvider>
  );
};