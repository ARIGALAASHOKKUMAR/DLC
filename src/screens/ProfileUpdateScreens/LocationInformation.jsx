import { useEffect, useState } from "react";
import { useDispatch,useSelector } from "react-redux";
import { BASICPROFILE, commonAPICall, GETDISTSAPP, GETMANDALSAPP, GETVILLAGESAPP } from "../../utils/utils";

import DateTimePicker from "@react-native-community/datetimepicker";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { FieldArray, FormikProvider, useFormik } from "formik";
import * as Location from "expo-location";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { styles } from "./styles";


export const LocationInformation = ({ userData, onUpdateSuccess }) => {
  const state = useSelector((state) => state.LoginReducer);
  const dispatch = useDispatch();

  const [dists, setDists] = useState([]);
  const [mandal, setMandal] = useState([]);
  const [village, setVillage] = useState([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

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

  const validationSchema = Yup.object().shape({
    district: Yup.string().required("Required / అవసరం"),
    mandal: Yup.string().required("Required / అవసరం"),
    village: Yup.string().required("Required / అవసరం"),
    plotOrHouseNumber: Yup.string().required("Required / అవసరం"),
    landmark: Yup.string().required("Required / అవసరం"),
    pincode: Yup.string().required("Required / అవసరం"),
    latitude: Yup.string().required("Required / అవసరం"),
    longitude: Yup.string().required("Required / అవసరం"),
  });

  // ✅ initialValues now populated from API data
  const formik = useFormik({
    initialValues: {
      userType: state.roleName,
      stageName: "LOCATION_ADDRESS",
      district: userData?.district?.toString() || "",
      mandal: userData?.mandal?.toString() || "",
      village: userData?.village?.toString() || "",
      plotOrHouseNumber: userData?.plot_or_house_number || "",
      landmark: userData?.landmark || "",
      pincode: userData?.pincode?.toString() || "",
      latitude: userData?.latitude?.toString() || "",
      longitude: userData?.longitude?.toString() || "",
    },
    validationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true, // This allows form to update when userData changes
  });

  async function handleSubmit(values, { setSubmitting, resetForm }) {
    try {
      // ✅ USING VALUES DIRECTLY AS PAYLOAD - NO MODIFICATIONS NEEDED

      const response = await commonAPICall(
        BASICPROFILE,
        values,
        "POST",
        dispatch,
      );

      if (response?.status === 200) {
        resetForm();
        onUpdateSuccess?.(); // refresh parent data

        setMandal([]);
        setVillage([]);
      }
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setSubmitting(false);
    }
  }

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

      // Only set if fields are empty
      if (!formik.values.latitude) {
        formik.setFieldValue(
          "latitude",
          String(location?.coords?.latitude || ""),
        );
      }
      if (!formik.values.longitude) {
        formik.setFieldValue(
          "longitude",
          String(location?.coords?.longitude || ""),
        );
      }
    } catch (error) {
      console.log("Location error:", error);
      Alert.alert(
        "Error / లోపం",
        "Unable to fetch location / స్థానాన్ని పొందడం సాధ్యం కాలేదు",
      );
    }
  };

  useEffect(() => {
    getdists();
    getLocation();
  }, []);

  return (
    <FormikProvider value={formik}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          Location Information / స్థాన సమాచారం
        </Text>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            District / జిల్లా <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View
            style={[
              styles.selectBox,
              formik.errors.district &&
                formik.touched.district &&
                styles.inputError,
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

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Mandal / మండలం <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View
            style={[
              styles.selectBox,
              formik.errors.mandal &&
                formik.touched.mandal &&
                styles.inputError,
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

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Village / గ్రామం <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View
            style={[
              styles.selectBox,
              formik.errors.village &&
                formik.touched.village &&
                styles.inputError,
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

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Door No. / డోర్ నంబర్ <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              formik.errors.plotOrHouseNumber &&
                formik.touched.plotOrHouseNumber &&
                styles.inputError,
            ]}
            value={formik.values.plotOrHouseNumber}
            onChangeText={formik.handleChange("plotOrHouseNumber")}
            onBlur={formik.handleBlur("plotOrHouseNumber")}
            placeholder="Enter Door No. / ద్వారం నంబర్ నమోదు చేయండి"
            maxLength={20}
          />
          {formik.errors.plotOrHouseNumber &&
            formik.touched.plotOrHouseNumber && (
              <Text style={styles.errorText}>
                {formik.errors.plotOrHouseNumber}
              </Text>
            )}
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Land mark / ల్యాండ్ మార్క్{" "}
            <Text style={styles.requiredStar}>*</Text>{" "}
          </Text>
          <TextInput
            style={[
              styles.input,
              formik.errors.landmark &&
                formik.touched.landmark &&
                styles.inputError,
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

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Pin Code / పిన్ కోడ్ <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              formik.errors.pincode &&
                formik.touched.pincode &&
                styles.inputError,
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

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Latitude / అక్షాంశం <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              formik.errors.latitude &&
                formik.touched.latitude &&
                styles.inputError,
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

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Longitude / రేఖాంశం <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              formik.errors.longitude &&
                formik.touched.longitude &&
                styles.inputError,
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

        <TouchableOpacity
          style={[
            styles.submitButton,
            formik.isSubmitting && styles.disabledButton,
          ]}
          onPress={formik.handleSubmit}
          disabled={formik.isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {formik.isSubmitting
              ? "SAVING... / సేవ్ చేస్తోంది..."
              : "SAVE / సేవ్ చేయండి"}
          </Text>
        </TouchableOpacity>
      </View>
    </FormikProvider>
  );
};
