import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASICPROFILE, commonAPICall, GETSKILLS } from "../../utils/utils";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  SafeAreaView,
} from "react-native";
import { FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { styles } from "./styles";

export const SkillDetails = ({ userData, onUpdateSuccess }) => {
  const state = useSelector((state) => state.LoginReducer);
  const dispatch = useDispatch();

  const [skillsList, setSkillsList] = useState([]);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);

  // Parse skills from API (stored as string "[1, 3, 5]")
  const parseSkills = () => {
    try {
      if (userData?.skills) {
        const parsedSkills = JSON.parse(userData.skills);
        console.log("userData?.skills", parsedSkills);

        return parsedSkills.map((item) => item.skillId);
      }
      return [];
    } catch (e) {
      console.log("Error parsing skills:", e);
      return [];
    }
  };

  const validationSchema = Yup.object().shape({
    skillIds: Yup.array()
      .min(1, "Required / అవసరం")
      .required("Required / అవసరం"),
    experienceYears: Yup.string().required("Required / అవసరం"),
    preferredWorkType: Yup.string().required("Required / అవసరం"),
    dailyRate: Yup.string().required("Required / అవసరం"),
    workType: Yup.string().required("Required / అవసరం"),
  });

  const formik = useFormik({
    initialValues: {
      userType: state.roleName,
      stageName: "SKILL_INFO",
      skillIds: parseSkills(),
      experienceYears: userData?.skill_experience_years?.toString() || "",
      preferredWorkType: userData?.skill_preferred_work_type || "",
      dailyRate: userData?.skill_daily_rate?.toString() || "",
      workType: userData?.skill_work_type || "",
    },
    validationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
  });

  const getSkillsData = async () => {
    try {
      const response = await commonAPICall(GETSKILLS, {}, "get", dispatch);

      if (response?.status === 200) {
        const skillData = response?.data?.Skill_Info_Details || [];
        setSkillsList(skillData);
      }
    } catch (error) {
      console.log("Error fetching skills:", error);
    }
  };

  useEffect(() => {
    getSkillsData();
  }, []);

  async function handleSubmit(values, { resetForm, setSubmitting }) {
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
        setShowSkillsDropdown(false);
        resetForm();
        onUpdateSuccess();
      }
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setSubmitting(false);
    }
  }

  const toggleSkill = (skillId) => {
    formik.setFieldTouched("skillIds", true);
    const selectedIds = formik.values.skillIds || [];

    if (selectedIds.includes(skillId)) {
      formik.setFieldValue(
        "skillIds",
        selectedIds.filter((id) => id !== skillId),
      );
    } else {
      formik.setFieldValue("skillIds", [...selectedIds, skillId]);
    }
  };

  const selectedSkillNames = skillsList
    .filter((item) => formik.values.skillIds.includes(item.id))
    .map((item) => item.skill_name)
    .join(", ");

  // Render skills dropdown as Modal for better visibility
  const renderSkillsDropdown = () => (
    <Modal
      visible={showSkillsDropdown}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowSkillsDropdown(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowSkillsDropdown(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Skills / నైపుణ్యాలను ఎంచుకోండి</Text>
            <TouchableOpacity
              onPress={() => setShowSkillsDropdown(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={skillsList}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={true}
            style={styles.modalList}
            renderItem={({ item, index }) => {
              const selected = formik.values.skillIds.includes(item.id);
              return (
                <TouchableOpacity
                  style={[
                    styles.skillItem,
                    styles.skillsDropdownItemNew,
                    selected && styles.skillsDropdownItemSelectedNew,
                    index === skillsList.length - 1 &&
                      styles.skillsDropdownLastItemNew,
                  ]}
                  onPress={() => toggleSkill(item.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.skillText,
                      styles.skillsDropdownTextNew,
                      selected && styles.skillsDropdownTextSelectedNew,
                    ]}
                  >
                    {item.skill_name}
                  </Text>
                  <Ionicons
                    name={selected ? "checkbox" : "square-outline"}
                    size={22}
                    color={selected ? "#1e3a5f" : "#999"}
                  />
                </TouchableOpacity>
              );
            }}
            ListFooterComponent={
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setShowSkillsDropdown(false)}
              >
                <Text style={styles.doneButtonText}>Done / పూర్తి</Text>
              </TouchableOpacity>
            }
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <FormikProvider value={formik}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Skill Details / నైపుణ్య వివరాలు</Text>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Select Skills / నైపుణ్యాలను ఎంచుకోండి{" "}
              <Text style={styles.requiredStar}>*</Text>
            </Text>

            <TouchableOpacity
              style={[
                styles.selectBox,
                styles.skillsSelectBoxNew,
                showSkillsDropdown && styles.skillsSelectBoxOpenNew,
                formik.touched.skillIds &&
                  formik.errors.skillIds &&
                  styles.inputError,
              ]}
              onPress={() => {
                formik.setFieldTouched("skillIds", true);
                setShowSkillsDropdown(true);
              }}
              activeOpacity={0.8}
            >
              <Text
                numberOfLines={2}
                style={[
                  styles.skillsSelectedTextNew,
                  { color: selectedSkillNames ? "#000" : "#999" },
                ]}
              >
                {selectedSkillNames || "Select Skills / నైపుణ్యాలను ఎంచుకోండి"}
              </Text>
              <Ionicons
                name={showSkillsDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color="#333"
              />
            </TouchableOpacity>

            {formik.touched.skillIds && formik.errors.skillIds ? (
              <Text style={styles.errorText}>{formik.errors.skillIds}</Text>
            ) : null}
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Experience / అనుభవం <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                formik.errors.experienceYears &&
                  formik.touched.experienceYears &&
                  styles.inputError,
              ]}
              value={formik.values.experienceYears}
              onChangeText={formik.handleChange("experienceYears")}
              onBlur={formik.handleBlur("experienceYears")}
              placeholder="Enter experience in years / సంవత్సరాలలో అనుభవం నమోదు చేయండి"
              keyboardType="numeric"
              maxLength={2}
            />
            {formik.errors.experienceYears && formik.touched.experienceYears && (
              <Text style={styles.errorText}>
                {formik.errors.experienceYears}
              </Text>
            )}
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Preferred Work Type / ప్రాధాన్య పని రకం{" "}
              <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View style={styles.radioColumn}>
              <TouchableOpacity
                style={styles.radioItem}
                onPress={() => {
                  formik.setFieldTouched("preferredWorkType", true);
                  formik.setFieldValue("preferredWorkType", "daily_wage");
                }}
              >
                <Ionicons
                  name={
                    formik.values.preferredWorkType === "daily_wage"
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={22}
                  color="#0d6efd"
                />
                <Text style={styles.radioText}>Daily Wage / రోజువారీ వేతనం</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioItem}
                onPress={() => {
                  formik.setFieldTouched("preferredWorkType", true);
                  formik.setFieldValue("preferredWorkType", "contract");
                }}
              >
                <Ionicons
                  name={
                    formik.values.preferredWorkType === "contract"
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={22}
                  color="#0d6efd"
                />
                <Text style={styles.radioText}>Contract / కాంట్రాక్ట్</Text>
              </TouchableOpacity>
            </View>
            {formik.errors.preferredWorkType &&
              formik.touched.preferredWorkType && (
                <Text style={styles.errorText}>
                  {formik.errors.preferredWorkType}
                </Text>
              )}
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Daily Rate / రోజువారీ రేటు{" "}
              <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                formik.errors.dailyRate &&
                  formik.touched.dailyRate &&
                  styles.inputError,
              ]}
              value={formik.values.dailyRate}
              onChangeText={formik.handleChange("dailyRate")}
              onBlur={formik.handleBlur("dailyRate")}
              placeholder="Enter daily rate / రోజువారీ రేటు నమోదు చేయండి"
              keyboardType="numeric"
              maxLength={6}
            />
            {formik.errors.dailyRate && formik.touched.dailyRate && (
              <Text style={styles.errorText}>{formik.errors.dailyRate}</Text>
            )}
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>
              Select Availability for Work / పని కోసం లభ్యతను ఎంచుకోండి{" "}
              <Text style={styles.requiredStar}>*</Text>
            </Text>
            <View
              style={[
                styles.selectBox,
                formik.errors.workType &&
                  formik.touched.workType &&
                  styles.inputError,
              ]}
            >
              <Picker
                style={styles.picker}
                selectedValue={formik.values.workType}
                onValueChange={(itemValue) => {
                  formik.setFieldTouched("workType", true);
                  formik.setFieldValue("workType", itemValue);
                }}
              >
                <Picker.Item
                  label="Select Availability / లభ్యతను ఎంచుకోండి"
                  value=""
                />
                <Picker.Item label="Yes / అవును" value="yes" />
                <Picker.Item label="No / లేదు" value="no" />
              </Picker>
            </View>
            {formik.errors.workType && formik.touched.workType && (
              <Text style={styles.errorText}>{formik.errors.workType}</Text>
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
      </ScrollView>

      {/* Skills Dropdown Modal */}
      {renderSkillsDropdown()}
    </FormikProvider>
  );
};