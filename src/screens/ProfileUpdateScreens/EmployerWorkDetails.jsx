import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASICPROFILE, commonAPICall, GETSKILLS } from "../../utils/utils";

import DateTimePicker from "@react-native-community/datetimepicker";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal, // Add Modal import
} from "react-native";
import { FieldArray, FormikProvider, useFormik } from "formik";
import * as Location from "expo-location";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { styles } from "./styles";
import { login } from "../../actions";

export const EmployerWorkDetails = ({ userData, onUpdateSuccess }) => {
  const state = useSelector((state) => state.LoginReducer);
  const dispatch = useDispatch();

  const [skillsList, setSkillsList] = useState([]);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);

  console.log("userDatauserData", userData?.average_workers_hired_per_month);

  const averageWorkersOptions = [
    { label: "1-10", value: 10 },
    { label: "11-50", value: 50 },
    { label: "51-100", value: 100 },
    { label: "100+", value: 101 },
  ];

  const normalizeCategoryIds = (categoriesValue) => {
    try {
      let parsed = categoriesValue;

      if (!parsed) return [];

      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }

      if (!Array.isArray(parsed)) return [];

      return parsed
        .map((item) => {
          if (typeof item === "number") return item;
          if (typeof item === "string") return Number(item);
          if (item && typeof item === "object") {
            return Number(item.categoryId ?? item.id);
          }
          return NaN;
        })
        .filter((id) => !isNaN(id));
    } catch (e) {
      console.log("Error parsing categories:", e);
      return [];
    }
  };

  const initialCategoryIds = useMemo(() => {
    return normalizeCategoryIds(userData?.categories);
  }, [userData?.categories]);

  const validationSchema = Yup.object().shape({
    workCategoryIds: Yup.array()
      .min(1, "Required / అవసరం")
      .required("Required / అవసరం"),
    averageWorkersHiredPerMonth: Yup.string().required("Required / అవసరం"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      userType: state.roleName,
      stageName: "EMPLOYER_WORK_DETAILS",
      workCategoryIds: initialCategoryIds,
      averageWorkersHiredPerMonth:
        userData?.average_workers_hired_per_month || "",
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  const getSkillsData = async () => {
    try {
      const response = await commonAPICall(GETSKILLS, {}, "get", dispatch);

      if (response?.status === 200) {
        setSkillsList(response?.data?.Skill_Info_Details || []);
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
      const payload = {
        userType: state.roleName,
        stageName: "EMPLOYER_WORK_DETAILS",
        workCategoryIds: normalizeCategoryIds(values.workCategoryIds),
        averageWorkersHiredPerMonth: Number(values.averageWorkersHiredPerMonth),
      };

      const response = await commonAPICall(
        BASICPROFILE,
        payload,
        "POST",
        dispatch,
      );

      if (response?.status === 200) {
        const updatedPayload = {
          ...state,
          isProfileUpdated: "Y",
        };
        resetForm();
        onUpdateSuccess?.();
        setShowSkillsDropdown(false);
        dispatch(login(updatedPayload));
      }
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setSubmitting(false);
    }
  }

  const toggleSkill = (skillId) => {
    const numericSkillId = Number(skillId);
    formik.setFieldTouched("workCategoryIds", true);

    const selectedIds = normalizeCategoryIds(formik.values.workCategoryIds);

    if (selectedIds.includes(numericSkillId)) {
      formik.setFieldValue(
        "workCategoryIds",
        selectedIds.filter((id) => id !== numericSkillId),
      );
    } else {
      formik.setFieldValue("workCategoryIds", [...selectedIds, numericSkillId]);
    }
  };

  const selectedSkillNames = skillsList
    .filter((item) =>
      normalizeCategoryIds(formik.values.workCategoryIds).includes(
        Number(item.id),
      ),
    )
    .map((item) => item.skill_name)
    .join(", ");

  return (
    <FormikProvider value={formik}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          Employer Work Details / యజమాని పని వివరాలు
        </Text>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Work Categories / పని వర్గాలు{" "}
            <Text style={styles.requiredStar}>*</Text>
          </Text>

          <TouchableOpacity
            style={[
              styles.selectBox,
              styles.skillsSelectBoxNew,
              showSkillsDropdown && styles.skillsSelectBoxOpenNew,
              formik.touched.workCategoryIds &&
                formik.errors.workCategoryIds &&
                styles.inputError,
            ]}
            onPress={() => {
              formik.setFieldTouched("workCategoryIds", true);
              setShowSkillsDropdown(!showSkillsDropdown);
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
              {selectedSkillNames ||
                "Select Work Categories / పని వర్గాలను ఎంచుకోండి"}
            </Text>

            <Ionicons
              name={showSkillsDropdown ? "chevron-up" : "chevron-down"}
              size={20}
              color="#333"
            />
          </TouchableOpacity>

          {/* Fix 1: Use absolute positioning for dropdown */}
          <View style={{ position: 'relative' }}>
            {showSkillsDropdown && (
              <View style={[
                styles.dropdownBox, 
                styles.skillsDropdownBoxNew,
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  zIndex: 9999, // High z-index
                  elevation: 9999, // For Android
                  backgroundColor: '#fff',
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 8,
                  maxHeight: 200,
                }
              ]}>
                <ScrollView>
                  {skillsList.map((item, index) => {
                    const selected = normalizeCategoryIds(
                      formik.values.workCategoryIds,
                    ).includes(Number(item.id));

                    return (
                      <TouchableOpacity
                        key={item.id}
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
                  })}
                </ScrollView>
              </View>
            )}
          </View>

          {formik.touched.workCategoryIds && formik.errors.workCategoryIds ? (
            <Text style={styles.errorText}>
              {formik.errors.workCategoryIds}
            </Text>
          ) : null}
        </View>

        <View style={styles.inputBlock}>
          <Text style={styles.label}>
            Average Workers Hired Per Month / నెలకు సగటు కార్మికులు
            నియమించబడ్డారు <Text style={styles.requiredStar}>*</Text>
          </Text>

          <View
            style={[
              styles.selectBox,
              formik.errors.averageWorkersHiredPerMonth &&
                formik.touched.averageWorkersHiredPerMonth &&
                styles.inputError,
            ]}
          >
            <Picker
              style={styles.picker}
              selectedValue={formik.values.averageWorkersHiredPerMonth}
              onValueChange={(itemValue) => {
                formik.setFieldTouched("averageWorkersHiredPerMonth", true);
                formik.setFieldValue("averageWorkersHiredPerMonth", itemValue);
              }}
            >
              <Picker.Item label="Select Range / పరిధిని ఎంచుకోండి" value="" />
              {averageWorkersOptions.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>
          </View>

          {formik.errors.averageWorkersHiredPerMonth &&
            formik.touched.averageWorkersHiredPerMonth && (
              <Text style={styles.errorText}>
                {formik.errors.averageWorkersHiredPerMonth}
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