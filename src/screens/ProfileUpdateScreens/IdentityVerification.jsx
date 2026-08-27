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
  Image,
} from "react-native";
import { FieldArray, FormikProvider, useFormik } from "formik";
import * as Location from "expo-location";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { styles } from "./styles";
import ImageBucketRN from "../../utils/ImageBucketRN";


export const IdentityVerification = ({ userData, onUpdateSuccess }) => {
  const state = useSelector((state) => state.LoginReducer);
  const dispatch = useDispatch();

  const showLabourLicence = state.roleName === "DLC Employer";
  const conditionalFieldName = showLabourLicence
    ? "labourLicence"
    : "eshramCardNumber";
  const conditionalFieldLabel = showLabourLicence
    ? "Labour Licence Number / లేబర్ లైసెన్స్ నంబర్"
    : "e-Shram Card Number / ఇ-శ్రమ్ కార్డ్ నంబర్";

  const validationSchema = Yup.object().shape({
    documentType: Yup.string().required("Required / అవసరం"),

    documentNumber: Yup.string()
      .required("Required / అవసరం")
      .test(
        "doc-validation",
        "Invalid Document Number / తప్పు డాక్యుమెంట్ నంబర్",
        function (value) {
          const { documentType } = this.parent;

          if (!value) return false;

          switch (documentType) {
            case "PAN":
              return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value);

            case "AADHAR":
              return /^[0-9]{12}$/.test(value);

            case "DRIVING_LICENSE":
              return /^[A-Z0-9]{8,16}$/.test(value);

            case "VOTER_ID":
              return /^[A-Z]{3}[0-9]{7}$/.test(value);

            default:
              return true;
          }
        },
      ),
    uploadDocument: Yup.string().required("Required / అవసరం"),
    [conditionalFieldName]: Yup.string().required("Required / అవసరం"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      userType: state.roleName,
      stageName: "DOCUMENT_VERIFICATION",
      documentType: userData?.document_type || "",
      documentNumber: userData?.document_number || "",
      uploadDocument: userData?.upload_document || "",
      [conditionalFieldName]: showLabourLicence
        ? userData?.labour_licence || ""
        : userData?.e_shram_card_number || "",
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  async function handleSubmit(values, { setSubmitting }) {
    try {
      const response = await commonAPICall(
        BASICPROFILE,
        values,
        "POST",
        dispatch,
      );

      if (response?.status === 200) {
        const updatedPayload = {
          ...state,
          isProfileUpdated: "Y",
        };
        // dispatch(login(updatedPayload));

        onUpdateSuccess?.(); // refresh latest profile data from parent
      }
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <FormikProvider value={formik}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          Identity & Verification / గుర్తింపు & ధృవీకరణ
        </Text>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Document Type / డాక్యుమెంట్ రకం{" "}
            <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View
            style={[
              styles.selectBox,
              formik.errors.documentType &&
                formik.touched.documentType &&
                styles.inputError,
            ]}
          >
            <Picker
            style={styles.picker}
              selectedValue={formik.values.documentType}
              onValueChange={(itemValue) => {
                formik.setFieldTouched("documentType", true);
                formik.setFieldValue("documentType", itemValue);
                formik.setFieldValue("documentNumber", ""); //
              }}
              enabled={!formik.isSubmitting}
            >
              <Picker.Item
                label="Select Document Type / డాక్యుమెంట్ రకాన్ని ఎంచుకోండి"
                value=""
              />
              <Picker.Item label="PAN / పాన్" value="PAN" />
              <Picker.Item
                label="Driving License / డ్రైవింగ్ లైసెన్స్"
                value="DRIVING_LICENSE"
              />
              <Picker.Item label="Voter ID / ఓటరు ID" value="VOTER_ID" />
              <Picker.Item label="Aadhar / అధార్" value="AADHAR" />
            </Picker>
          </View>
          {formik.errors.documentType && formik.touched.documentType && (
            <Text style={styles.errorText}>{formik.errors.documentType}</Text>
          )}
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Document Number / డాక్యుమెంట్ నంబర్{" "}
            <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              formik.errors.documentNumber &&
                formik.touched.documentNumber &&
                styles.inputError,
            ]}
            value={formik.values.documentNumber}
            onChangeText={formik.handleChange("documentNumber")}
            onBlur={formik.handleBlur("documentNumber")}
            placeholder="Enter Document Number / డాక్యుమెంట్ నంబర్ నమోదు చేయండి"
            editable={!formik.isSubmitting}
          />
          {formik.errors.documentNumber && formik.touched.documentNumber && (
            <Text style={styles.errorText}>{formik.errors.documentNumber}</Text>
          )}
        </View>

       <View style={styles.inputBlock}>
  <Text style={styles.label}>
    Upload Certificate / సర్టిఫికేట్ అప్లోడ్ చేయండి{" "}
    {/* <Text style={styles.requiredStar}>*</Text> */}
  </Text>
  <TouchableOpacity
    style={[
      styles.uploadButton,
      formik.errors.uploadDocument && 
      formik.touched.uploadDocument && 
      styles.inputError,
    ]}
    onPress={async () => {
      formik.setFieldTouched("uploadDocument", true);

      // Use the same bucket upload approach
      let path = "APFD/SAWMILLS/CERTIFICATES/";

      ImageBucketRN(
        formik,
        path,
        "uploadDocument", // Simple field name, not array path
        20971520, // 20MB
        "all",
        dispatch
      );
    }}
  >
    <Text style={styles.uploadButtonText}>
      Upload Certificate / సర్టిఫికేట్ అప్లోడ్ చేయండి
    </Text>
  </TouchableOpacity>

  {/* File Preview */}
  <View style={{ alignItems: "center" }}>
    {formik.values.uploadDocument ? (
      (() => {
        const fileUrl = formik.values.uploadDocument;
        const isImage = /\.(jpg|jpeg|png)$/i.test(fileUrl);
        const isPdf = /\.pdf$/i.test(fileUrl);

        // ✅ IMAGE PREVIEW
        if (isImage) {
          return (
            <View style={{ marginTop: 10 }}>
              <Image
                source={{ uri: fileUrl }}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 8,
                  resizeMode: "cover",
                }}
              />
            </View>
          );
        }

        // ✅ PDF DOWNLOAD ICON
        if (isPdf) {
          return (
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 10,
              }}
              onPress={() => Linking.openURL(fileUrl)}
            >
              <Ionicons
                name="document-text-outline"
                size={24}
                color="red"
              />
              <Text style={{ marginLeft: 8, color: "blue" }}>
                Download PDF
              </Text>
            </TouchableOpacity>
          );
        }

        // ✅ DEFAULT (other files)
        return <Text style={styles.fileNameText}>{fileUrl}</Text>;
      })()
    ) : null}
  </View>

  {formik.errors.uploadDocument && formik.touched.uploadDocument && (
    <Text style={styles.errorText}>{formik.errors.uploadDocument}</Text>
  )}
</View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            {conditionalFieldLabel} <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              formik.errors[conditionalFieldName] &&
                formik.touched[conditionalFieldName] &&
                styles.inputError,
            ]}
            value={formik.values[conditionalFieldName]}
            onChangeText={formik.handleChange(conditionalFieldName)}
            onBlur={formik.handleBlur(conditionalFieldName)}
            placeholder={`Enter ${conditionalFieldLabel} / ${conditionalFieldLabel} నమోదు చేయండి`}
            editable={!formik.isSubmitting}
          />
          {formik.errors[conditionalFieldName] &&
            formik.touched[conditionalFieldName] && (
              <Text style={styles.errorText}>
                {formik.errors[conditionalFieldName]}
              </Text>
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