import { useState } from "react";
import { useDispatch ,useSelector} from "react-redux";
import { BASICPROFILE, commonAPICall } from "../../utils/utils";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
} from "react-native";
import { FieldArray, FormikProvider, useFormik } from "formik";
import * as Location from "expo-location";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { styles } from "./styles";
import ImageBucketRN from "../../utils/ImageBucketRN";
import { login } from "../../actions";


export const Education = ({ userData, onUpdateSuccess }) => {
  const state = useSelector((state) => state.LoginReducer);
  const dispatch = useDispatch();

  // Parse education from API (stored as JSON string)
  const parseEducation = () => {
    try {
      if (userData?.education) {
        const parsedData = JSON.parse(userData.education);

        return parsedData.map((item) => ({
          educationLevel: item.educationLevel || "",
          institutionName: item.institutionName || "",
          passingYear: item.passingYear?.toString() || "",
          uploadCertificate: item.certificate || "",
        }));
      }
      return [];
    } catch (e) {
      console.log("Error parsing education:", e);
      return [];
    }
  };

  const emptyEducation = {
    educationLevel: "",
    institutionName: "",
    passingYear: "",
    uploadCertificate: "",
  };

  const validationSchema = Yup.object().shape({
    workerEducationList: Yup.array()
      .of(
        Yup.object().shape({
          educationLevel: Yup.string().required("Required / అవసరం"),
          institutionName: Yup.string().when('educationLevel', {
            is: (val) => val && val !== 'uneducated',
            then: () => Yup.string().required("Required / అవసరం"),
            otherwise: () => Yup.string().notRequired()
          }),
          passingYear: Yup.string().when('educationLevel', {
            is: (val) => val && val !== 'uneducated',
            then: () => Yup.string().required("Required / అవసరం"),
            otherwise: () => Yup.string().notRequired()
          }),
          // uploadCertificate: Yup.string().when('educationLevel', {
          //   is: (val) => val && val !== 'uneducated',
          //   then: () => Yup.string().required("Required / అవసరం"),
          //   otherwise: () => Yup.string().notRequired()
          // }),
        }),
      )
      .min(1, "Required / అవసరం"),
  });

  // Initialize with parsed education data
  const initialEducation = parseEducation();

  const formik = useFormik({
    initialValues: {
      userType: state.roleName,
      stageName: "EDUCATION",
      workerEducationList:
        initialEducation.length > 0 ? initialEducation : [emptyEducation],
    },
    validationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true, // Allow form to update when userData changes
  });

  async function handleSubmit(values, { resetForm, setSubmitting }) {
    try {
      // ✅ USING VALUES DIRECTLY AS PAYLOAD

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
        dispatch(login(updatedPayload));
        resetForm();
        onUpdateSuccess();
      }
    } catch (error) {
      console.log("Submit Error =>", error);
    } finally {
      setSubmitting(false);
    }
  }

  const getError = (index, field) =>
    formik.touched?.workerEducationList?.[index]?.[field] &&
    formik.errors?.workerEducationList?.[index]?.[field];

  return (
    <FormikProvider value={formik}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Education / విద్య</Text>

          <FieldArray
            name="workerEducationList"
            render={(arrayHelpers) => (
              <>
                {formik.values.workerEducationList.map((item, index) => {
                  const isUneducated = item.educationLevel === 'uneducated';
                  
                  return (
                  <View key={index} style={styles.educationCard}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.subTitle}>
                        Qualification {index + 1} / అర్హత {index + 1}
                      </Text>
                      {formik.values.workerEducationList.length > 1 && (
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => arrayHelpers.remove(index)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color="#fff"
                          />
                          <Text style={styles.deleteBtnText}>
                            తొలగించు
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={styles.inputBlock}>
                      <Text style={styles.label}>
                        Education Level / విద్యా స్థాయి{" "}
                        <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <View
                        style={[
                          styles.selectBox,
                          getError(index, "educationLevel") &&
                            styles.inputError,
                        ]}
                      >
                        <Picker
                         style={styles.picker}
                          selectedValue={item.educationLevel}
                          onValueChange={(itemValue) => {
                            formik.setFieldTouched(
                              `workerEducationList[${index}].educationLevel`,
                              true,
                            );
                            formik.setFieldValue(
                              `workerEducationList[${index}].educationLevel`,
                              itemValue,
                            );
                            // Clear other fields if uneducated is selected
                            if (itemValue === 'uneducated') {
                              formik.setFieldValue(
                                `workerEducationList[${index}].institutionName`,
                                '',
                              );
                              formik.setFieldValue(
                                `workerEducationList[${index}].passingYear`,
                                '',
                              );
                              formik.setFieldValue(
                                `workerEducationList[${index}].uploadCertificate`,
                                '',
                              );
                            }
                          }}
                        >
                          <Picker.Item
                            label="Select Education Level / విద్యా స్థాయిని ఎంచుకోండి"
                            value=""
                          />
                          <Picker.Item label="Uneducated / చదువు లేని" value="uneducated" />
                          <Picker.Item label="1st Class / 1వ తరగతి" value="1st" />
                          <Picker.Item label="2nd Class / 2వ తరగతి" value="2nd" />
                          <Picker.Item label="3rd Class / 3వ తరగతి" value="3rd" />
                          <Picker.Item label="4th Class / 4వ తరగతి" value="4th" />
                          <Picker.Item label="5th Class / 5వ తరగతి" value="5th" />
                          <Picker.Item label="6th Class / 6వ తరగతి" value="6th" />
                          <Picker.Item label="7th Class / 7వ తరగతి" value="7th" />
                          <Picker.Item label="8th Class / 8వ తరగతి" value="8th" />
                          <Picker.Item label="9th Class / 9వ తరగతి" value="9th" />
                          <Picker.Item label="10th Class / 10వ తరగతి" value="10th" />
                          <Picker.Item label="11th Class / 11వ తరగతి" value="11th" />
                          <Picker.Item label="12th Class / 12వ తరగతి" value="12th" />
                          <Picker.Item
                            label="Graduation / డిగ్రీ"
                            value="graduation"
                          />
                          <Picker.Item
                            label="Post Graduation / పోస్ట్ గ్రాడ్యుయేషన్"
                            value="post_graduation"
                          />
                          <Picker.Item
                            label="Diploma / డిప్లొమా"
                            value="diploma"
                          />
                        </Picker>
                      </View>
                      {getError(index, "educationLevel") ? (
                        <Text style={styles.errorText}>
                          {
                            formik.errors.workerEducationList[index]
                              .educationLevel
                          }
                        </Text>
                      ) : null}
                    </View>

                    {!isUneducated && (
                      <>
                        <View style={styles.inputBlock}>
                          <Text style={styles.label}>
                            Institute / School / College / సంస్థ / పాఠశాల / కళాశాల{" "}
                            <Text style={styles.requiredStar}>*</Text>
                          </Text>
                          <TextInput
                            style={[
                              styles.input,
                              getError(index, "institutionName") &&
                                styles.inputError,
                            ]}
                            value={item.institutionName}
                            onChangeText={formik.handleChange(
                              `workerEducationList[${index}].institutionName`,
                            )}
                            onBlur={formik.handleBlur(
                              `workerEducationList[${index}].institutionName`,
                            )}
                            placeholder="Enter Institute / School / College Name / సంస్థ / పాఠశాల / కళాశాల పేరు నమోదు చేయండి"
                          />
                          {getError(index, "institutionName") ? (
                            <Text style={styles.errorText}>
                              {
                                formik.errors.workerEducationList[index]
                                  .institutionName
                              }
                            </Text>
                          ) : null}
                        </View>

                        <View style={styles.inputBlock}>
                          <Text style={styles.label}>
                            Passing Year / ఉత్తీర్ణత సంవత్సరం{" "}
                            <Text style={styles.requiredStar}>*</Text>
                          </Text>
                          <TextInput
                            style={[
                              styles.input,
                              getError(index, "passingYear") && styles.inputError,
                            ]}
                            value={item.passingYear}
                            onChangeText={formik.handleChange(
                              `workerEducationList[${index}].passingYear`,
                            )}
                            onBlur={formik.handleBlur(
                              `workerEducationList[${index}].passingYear`,
                            )}
                            placeholder="Enter Passing Year / ఉత్తీర్ణత సంవత్సరం నమోదు చేయండి"
                            keyboardType="numeric"
                            maxLength={4}
                          />
                          {getError(index, "passingYear") ? (
                            <Text style={styles.errorText}>
                              {formik.errors.workerEducationList[index].passingYear}
                            </Text>
                          ) : null}
                        </View>

                        <View style={styles.inputBlock}>
                          <Text style={styles.label}>
                            Upload Certificate / సర్టిఫికేట్ అప్లోడ్ చేయండి{" "}
                            {/* <Text style={styles.requiredStar}>*</Text> */}
                          </Text>
                          <TouchableOpacity
                            style={[
                              styles.uploadButton,
                              getError(index, "uploadCertificate") &&
                                styles.inputError,
                            ]}
                            onPress={async () => {
                              formik.setFieldTouched(
                                `workerEducationList[${index}].uploadCertificate`,
                                true,
                              );

                              // Use ImageBucketRN for actual upload
                              let path = "APFD/SAWMILLS/CERTIFICATES/";
                              
                              ImageBucketRN(
                                formik,
                                path,
                                `workerEducationList[${index}].uploadCertificate`,
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
                            {item.uploadCertificate ? (
                              (() => {
                                const fileUrl = item.uploadCertificate;
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

                                // ✅ DEFAULT (other files or placeholder text)
                                if (fileUrl === "certificate-uploaded") {
                                  return (
                                    <Text style={[styles.fileNameText, { marginTop: 5 }]}>
                                      Certificate selected / సర్టిఫికేట్ ఎంచుకోబడింది
                                    </Text>
                                  );
                                }

                                return <Text style={styles.fileNameText}>{fileUrl}</Text>;
                              })()
                            ) : null}
                          </View>

                          {getError(index, "uploadCertificate") ? (
                            <Text style={styles.errorText}>
                              {
                                formik.errors.workerEducationList[index]
                                  .uploadCertificate
                              }
                            </Text>
                          ) : null}
                        </View>
                      </>
                    )}

                    {isUneducated && (
                      <View style={styles.inputBlock}>
                        <Text style={[styles.label, { color: '#666' }]}>
                          No further details required for uneducated / చదువు లేని వారికి ఎటువంటి వివరాలు అవసరం లేదు
                        </Text>
                      </View>
                    )}
                  </View>
                )})}

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => arrayHelpers.push({ ...emptyEducation })}
                >
                  <Text style={styles.addButtonText}>
                    + Add Qualification / అర్హతను జోడించండి
                  </Text>
                </TouchableOpacity>
              </>
            )}
          />

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
      </ScrollView>
    </FormikProvider>
  );
};