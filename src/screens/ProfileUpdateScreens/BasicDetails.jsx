import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASICPROFILE, commonAPICall, GETDISTSAPP, GETMANDALSAPP, GETVILLAGESAPP } from "../../utils/utils";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { styles } from "./styles";
import * as Location from "expo-location";

export const BasicAndLocationDetails = ({ userData, onUpdateSuccess }) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.LoginReducer);

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());

  // Location dropdown states
  const [dists, setDists] = useState([]);
  const [mandal, setMandal] = useState([]);
  const [village, setVillage] = useState([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  const employerTypes = [
    { id: 1, label: "Individual / వ్యక్తిగత" },
    { id: 2, label: "Contractor / కాంట్రాక్టర్" },
    { id: 3, label: "Company / కంపెనీ" },
    { id: 4, label: "Agency / ఏజెన్సీ" },
  ];

  // ========== DATE HELPER FUNCTIONS ==========
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

  const getDateForPicker = (dateStr) => {
    if (!dateStr) return new Date(2000, 0, 1);
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

  const formatInitialDate = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split("-");
      return `${day}-${month}-${year}`;
    }
    return dateStr;
  };

  const getMinDate = () => {
    const minDate = new Date();
    minDate.setFullYear(1900, 0, 1);
    minDate.setHours(0, 0, 0, 0);
    return minDate;
  };

  // ========== LOCATION API FUNCTIONS ==========
  const getdists = async () => {
    const response = await commonAPICall(GETDISTSAPP, {}, "get", dispatch);
    if (response?.status === 200) {
      setDists(response?.data?.District_List || []);
    }
  };

  const getmandals = async (distcode) => {
    try {
      const response = await commonAPICall(
        GETMANDALSAPP + distcode,
        {},
        "get",
        dispatch,
      );
      if (response?.status === 200) {
        setMandal(response?.data?.Mandal_List || []);
      } else {
        setMandal([]);
      }
    } catch (error) {
      console.log("Error fetching mandals:", error);
      setMandal([]);
    }
  };

  const getVillages = async (distcode, mandalcode) => {
    try {
      const cleanMandalCode = String(mandalcode || "").replace(/,/g, "");
      const response = await commonAPICall(
        `${GETVILLAGESAPP}?distCode=${distcode}&mandalCode=${cleanMandalCode}`,
        {},
        "get",
        dispatch,
      );
      if (response?.status === 200) {
        setVillage(response?.data?.Village_List || []);
      } else {
        setVillage([]);
      }
    } catch (error) {
      console.log("Error fetching villages:", error);
      setVillage([]);
    }
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied / అనుమతి నిరాకరించబడింది",
          "Location permission is required / స్థాన అనుమతి అవసరం",
        );
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      if (!formik.values.latitude) {
        formik.setFieldValue("latitude", String(location?.coords?.latitude || ""));
      }
      if (!formik.values.longitude) {
        formik.setFieldValue("longitude", String(location?.coords?.longitude || ""));
      }
    } catch (error) {
      console.log("Location error:", error);
      Alert.alert(
        "Error / లోపం",
        "Unable to fetch location / స్థానాన్ని పొందడం సాధ్యం కాలేదు",
      );
    }
  };

  // Load initial mandals and villages based on user data
  useEffect(() => {
    const loadInitialData = async () => {
      if (userData?.district && !initialDataLoaded) {
        await getmandals(userData.district);
        if (userData?.mandal) {
          await getVillages(userData.district, userData.mandal);
        }
        setInitialDataLoaded(true);
      }
    };

    if (dists.length > 0) {
      loadInitialData();
    }
  }, [userData, dists, initialDataLoaded]);

  useEffect(() => {
    getdists();
    getLocation();
  }, []);

  // ========== VALIDATION SCHEMA ==========
  const validationSchema = Yup.object().shape({
    // Basic Details
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
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
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
    email: Yup.string().required("Required / అవసరం"),

    // Location Details
    district: Yup.string().required("Required / అవసరం"),
    mandal: Yup.string().required("Required / అవసరం"),
    village: Yup.string().required("Required / అవసరం"),
    plotOrHouseNumber: Yup.string().required("Required / అవసరం"),
    landmark: Yup.string().required("Required / అవసరం"),
    pincode: Yup.string().required("Required / అవసరం"),
    latitude: Yup.string().required("Required / అవసరం"),
    longitude: Yup.string().required("Required / అవసరం"),
  });

  // ========== FORM INITIALIZATION ==========
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      // Basic Details
      fullName: userData?.full_name || "",
      dateOfBirth: userData?.date_of_birth ? formatInitialDate(userData.date_of_birth) : "",
      gender: userData?.gender || "",
      mobileNumber: userData?.mobile_number || "",
      email: userData?.email || "",
      profileImage: userData?.profile_image || "base64imageorURL",
      employerTypeId: userData?.employer_type_id ? String(userData.employer_type_id) : "",
      
      // Location Details
      district: userData?.district?.toString() || "",
      mandal: userData?.mandal?.toString() || "",
      village: userData?.village?.toString() || "",
      plotOrHouseNumber: userData?.plot_or_house_number || "",
      landmark: userData?.landmark || "",
      pincode: userData?.pincode?.toString() || "",
      latitude: userData?.latitude?.toString() || "",
      longitude: userData?.longitude?.toString() || "",
      
      // Common
      userType: state.roleName,
      stageName: "BASIC_INFO", // or "LOCATION_ADDRESS" based on your flow
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  // ========== SUBMIT HANDLER ==========
  async function handleSubmit(values, { setSubmitting, resetForm }) {
    try {
      // Create unified payload
      const payload = {
        // Basic Details
        full_name: values.fullName,
        date_of_birth: formatDateForAPI(values.dateOfBirth),
        gender: values.gender,
        mobile_number: values.mobileNumber,
        email: values.email,
        profile_image: values.profileImage,
        employer_type_id: values.employerTypeId ? Number(values.employerTypeId) : "",
        
        // Location Details
        district: values.district ? Number(values.district) : "",
        mandal: values.mandal ? Number(values.mandal) : "",
        village: values.village ? Number(values.village) : "",
        plot_or_house_number: values.plotOrHouseNumber,
        landmark: values.landmark,
        pincode: values.pincode ? Number(values.pincode) : "",
        latitude: values.latitude ? Number(values.latitude) : "",
        longitude: values.longitude ? Number(values.longitude) : "",
        
        // Common
        userType: values.userType,
        stageName: values.stageName,
      };

      const response = await commonAPICall(
        BASICPROFILE,
        payload,
        "POST",
        dispatch,
      );

      if (response?.status === 200) {
        resetForm();
        onUpdateSuccess?.();
        
        // Reset location dropdowns
        setMandal([]);
        setVillage([]);
        setInitialDataLoaded(false);
      }
    } catch (error) {
      console.log("Error:", error);
      Alert.alert("Error / లోపం", "Failed to update profile / ప్రొఫైల్ అప్డేట్ విఫలమైంది");
    } finally {
      setSubmitting(false);
    }
  }

  // ========== EVENT HANDLERS ==========
  const handleDateChange = (event, selectedDate) => {
    if (selectedDate === undefined || selectedDate === null) {
      setShowDatePicker(false);
      return;
    }
    setShowDatePicker(false);
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const formatted = `${day}-${month}-${year}`;
    formik.setFieldValue("dateOfBirth", formatted);
    formik.setFieldTouched("dateOfBirth", true);
  };

  const handleDateDismiss = () => {
    setShowDatePicker(false);
  };

  const openDatePicker = () => {
    const date = getDateForPicker(formik.values.dateOfBirth);
    setPickerDate(date);
    formik.setFieldTouched("dateOfBirth", true);
    setShowDatePicker(true);
  };

  const showEmployerType = state.roleName === "DLC Employer";

  return (
    <FormikProvider value={formik}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Basic Details / ప్రాథమిక వివరాలు
          </Text>

          {/* Full Name */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Full Name / పూర్తి పేరు <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                formik.errors.fullName && formik.touched.fullName && styles.inputError,
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

          {/* Date of Birth */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Date of Birth / పుట్టిన తేదీ <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.datePickerButton,
                {
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                },
                formik.errors.dateOfBirth && formik.touched.dateOfBirth && {
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
                minimumDate={getMinDate()}
                onChange={handleDateChange}
                onDismiss={handleDateDismiss}
                neutralButtonLabel="Cancel"
              />
            )}
          </View>

          {/* Gender */}
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
                    name={formik.values.gender === g ? "radio-button-on" : "radio-button-off"}
                    size={22}
                    color={formik.values.gender === g ? "#007AFF" : "#666"}
                  />
                  <Text style={styles.radioLabel}>
                    {g === "MALE" ? "MALE / పురుషుడు" : g === "FEMALE" ? "FEMALE / స్త్రీ" : "OTHER / ఇతర"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {formik.errors.gender && formik.touched.gender && (
              <Text style={styles.errorText}>{formik.errors.gender}</Text>
            )}
          </View>

          {/* Mobile Number */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Mobile Number / మొబైల్ నంబర్ <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                formik.errors.mobileNumber && formik.touched.mobileNumber && styles.inputError,
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

          {/* Email */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Email / ఇమెయిల్</Text>
            <TextInput
              style={[
                styles.input,
                formik.errors.email && formik.touched.email && styles.inputError,
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

          {/* Employer Type (Conditional) */}
          {showEmployerType && (
            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                Employer Type / యజమాని రకం <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.selectBox,
                  formik.errors.employerTypeId && formik.touched.employerTypeId && styles.inputError,
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
              {formik.errors.employerTypeId && formik.touched.employerTypeId && (
                <Text style={styles.errorText}>{formik.errors.employerTypeId}</Text>
              )}
            </View>
          )}
        </View>

        {/* Location Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Location Information / స్థాన సమాచారం
          </Text>

          {/* District */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              District / జిల్లా <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View
              style={[
                styles.selectBox,
                formik.errors.district && formik.touched.district && styles.inputError,
              ]}
            >
              <Picker
                style={styles.picker}
                selectedValue={formik.values.district}
                onValueChange={(itemValue) => {
                  formik.setFieldTouched("district", true);
                  formik.setFieldValue("district", itemValue);
                  formik.setFieldValue("mandal", "");
                  formik.setFieldValue("village", "");
                  setMandal([]);
                  setVillage([]);
                  if (itemValue) {
                    getmandals(itemValue);
                  }
                }}
              >
                <Picker.Item
                  label="---Select District / జిల్లాను ఎంచుకోండి---"
                  value=""
                />
                {dists.map((dist) => (
                  <Picker.Item
                    key={String(dist.dist_code)}
                    label={dist.dist_name}
                    value={String(dist.dist_code)}
                  />
                ))}
              </Picker>
            </View>
            {formik.errors.district && formik.touched.district && (
              <Text style={styles.errorText}>{formik.errors.district}</Text>
            )}
          </View>

          {/* Mandal */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Mandal / మండలం <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View
              style={[
                styles.selectBox,
                formik.errors.mandal && formik.touched.mandal && styles.inputError,
              ]}
            >
              <Picker
                style={styles.picker}
                selectedValue={formik.values.mandal}
                onValueChange={(itemValue) => {
                  formik.setFieldTouched("mandal", true);
                  formik.setFieldValue("mandal", itemValue);
                  formik.setFieldValue("village", "");
                  setVillage([]);
                  if (itemValue && formik.values.district) {
                    getVillages(formik.values.district, itemValue);
                  }
                }}
                enabled={!!formik.values.district}
              >
                <Picker.Item
                  label="---Select Mandal / మండలాన్ని ఎంచుకోండి---"
                  value=""
                />
                {mandal.map((item) => (
                  <Picker.Item
                    key={String(item.mandal_code)}
                    label={item.mandal_name}
                    value={String(item.mandal_code)}
                  />
                ))}
              </Picker>
            </View>
            {formik.errors.mandal && formik.touched.mandal && (
              <Text style={styles.errorText}>{formik.errors.mandal}</Text>
            )}
          </View>

          {/* Village */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Village / గ్రామం <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View
              style={[
                styles.selectBox,
                formik.errors.village && formik.touched.village && styles.inputError,
              ]}
            >
              <Picker
                style={styles.picker}
                selectedValue={formik.values.village}
                onValueChange={(itemValue) => {
                  formik.setFieldTouched("village", true);
                  formik.setFieldValue("village", itemValue);
                }}
                enabled={!!formik.values.mandal}
              >
                <Picker.Item
                  label="---Select Village / గ్రామాన్ని ఎంచుకోండి---"
                  value=""
                />
                {village.map((item) => (
                  <Picker.Item
                    key={String(item.village_code)}
                    label={item.village_name}
                    value={String(item.village_code)}
                  />
                ))}
              </Picker>
            </View>
            {formik.errors.village && formik.touched.village && (
              <Text style={styles.errorText}>{formik.errors.village}</Text>
            )}
          </View>

          {/* Door No. */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Door No. / డోర్ నంబర్ <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                formik.errors.plotOrHouseNumber && formik.touched.plotOrHouseNumber && styles.inputError,
              ]}
              value={formik.values.plotOrHouseNumber}
              onChangeText={formik.handleChange("plotOrHouseNumber")}
              onBlur={formik.handleBlur("plotOrHouseNumber")}
              placeholder="Enter Door No. / ద్వారం నంబర్ నమోదు చేయండి"
              maxLength={20}
            />
            {formik.errors.plotOrHouseNumber && formik.touched.plotOrHouseNumber && (
              <Text style={styles.errorText}>{formik.errors.plotOrHouseNumber}</Text>
            )}
          </View>

          {/* Landmark */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Land mark / ల్యాండ్ మార్క్ <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                formik.errors.landmark && formik.touched.landmark && styles.inputError,
              ]}
              value={formik.values.landmark}
              onChangeText={formik.handleChange("landmark")}
              onBlur={formik.handleBlur("landmark")}
              placeholder="Enter Landmark / ల్యాండ్మార్క్ నమోదు చేయండి"
              maxLength={100}
            />
            {formik.errors.landmark && formik.touched.landmark && (
              <Text style={styles.errorText}>{formik.errors.landmark}</Text>
            )}
          </View>

          {/* Pin Code */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Pin Code / పిన్ కోడ్ <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                formik.errors.pincode && formik.touched.pincode && styles.inputError,
              ]}
              value={formik.values.pincode}
              onChangeText={formik.handleChange("pincode")}
              onBlur={formik.handleBlur("pincode")}
              placeholder="Enter Pin Code / పిన్ కోడ్ నమోదు చేయండి"
              keyboardType="numeric"
              maxLength={6}
            />
            {formik.errors.pincode && formik.touched.pincode && (
              <Text style={styles.errorText}>{formik.errors.pincode}</Text>
            )}
          </View>

          {/* Latitude */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Latitude / అక్షాంశం <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                formik.errors.latitude && formik.touched.latitude && styles.inputError,
              ]}
              value={formik.values.latitude}
              onChangeText={formik.handleChange("latitude")}
              onBlur={formik.handleBlur("latitude")}
              placeholder="Latitude / అక్షాంశం"
            />
            {formik.errors.latitude && formik.touched.latitude && (
              <Text style={styles.errorText}>{formik.errors.latitude}</Text>
            )}
          </View>

          {/* Longitude */}
          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Longitude / రేఖాంశం <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                formik.errors.longitude && formik.touched.longitude && styles.inputError,
              ]}
              value={formik.values.longitude}
              onChangeText={formik.handleChange("longitude")}
              onBlur={formik.handleBlur("longitude")}
              placeholder="Longitude / రేఖాంశం"
            />
            {formik.errors.longitude && formik.touched.longitude && (
              <Text style={styles.errorText}>{formik.errors.longitude}</Text>
            )}
          </View>

          {/* Submit Button */}
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