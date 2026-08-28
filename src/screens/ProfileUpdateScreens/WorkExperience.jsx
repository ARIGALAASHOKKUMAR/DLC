import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASICPROFILE, commonAPICall, GETSKILLS } from "../../utils/utils";

import DateTimePicker from "@react-native-community/datetimepicker";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { styles } from "./styles";

export const WorkExperience = ({ userData, onUpdateSuccess }) => {
  const state = useSelector((state) => state.LoginReducer);
  const dispatch = useDispatch();

  const [skillsList, setSkillsList] = useState([]);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [currentSkillIndex, setCurrentSkillIndex] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentField, setCurrentField] = useState("");
  const [currentIndex, setCurrentIndex] = useState(null);
  const [pickerDate, setPickerDate] = useState(new Date());

  // Format date from API (YYYY-MM-DD) to display format (DD-MM-YYYY)
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "";

    const ddmmyyyyPattern = /^\d{2}-\d{2}-\d{4}$/;
    if (ddmmyyyyPattern.test(dateStr)) {
      return dateStr;
    }

    const yyyymmddPattern = /^\d{4}-\d{2}-\d{2}$/;
    if (yyyymmddPattern.test(dateStr)) {
      const [yyyy, mm, dd] = dateStr.split("-");
      return `${dd}-${mm}-${yyyy}`;
    }

    return "";
  };

  // Parse work history from API (stored as JSON string)
  const parseWorkHistory = () => {
    try {
      if (userData?.work_history) {
        const parsedData = JSON.parse(userData.work_history);

        return parsedData.map((item) => ({
          employeeName: item.employeeName || "",
          projectName: item.projectName || "",
          workPlace: item.workPlace || "",
          workType: item.workType || "",
          skillIds: item.skillId ? item.skillId : [],
          taskDescription: item.taskDescription || "",
          startDate: item.startDate ? formatDateForDisplay(item.startDate) : "",
          endDate: item.endDate ? formatDateForDisplay(item.endDate) : "",
          daysWorked: item.daysWorked?.toString() || "",
          dailyWage: item.dailyWage?.toString() || "",
          totalAmount: item.totalAmount?.toString() || "",
          paymentStatus: item.paymentStatus || "",
          remarks: item.remarks || "",
          rating: item.rating?.toString() || "",
        }));
      }
      return [];
    } catch (e) {
      console.log("Error parsing work history:", e);
      return [];
    }
  };

  const emptyExperience = {
    employeeName: "",
    projectName: "",
    workPlace: "",
    workType: "",
    skillIds: [],
    taskDescription: "",
    startDate: "",
    endDate: "",
    daysWorked: "",
    dailyWage: "",
    totalAmount: "",
    paymentStatus: "",
    remarks: "",
    rating: "",
  };

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

  const validationSchema = Yup.object().shape({
    workerExperienceList: Yup.array().of(
      Yup.object().shape({
        // employeeName: Yup.string().required("Required / అవసరం"),
        // projectName: Yup.string().required("Required / అవసరం"),
        // workPlace: Yup.string().required("Required / అవసరం"),
        // workType: Yup.string().required("Required / అవసరం"),
        // skillIds: Yup.array()
        //   .min(1, "Required / అవసరం")
        //   .required("Required / అవసరం"),
        // taskDescription: Yup.string().required("Required / అవసరం"),
        // startDate: Yup.string().required("Required / అవసరం"),
        // endDate: Yup.string().required("Required / అవసరం"),
        // daysWorked: Yup.string().required("Required / అవసరం"),
        // dailyWage: Yup.string().required("Required / అవసరం"),
        // totalAmount: Yup.string().required("Required / అవసరం"),
        // paymentStatus: Yup.string().required("Required / అవసరం"),
        // remarks: Yup.string().required("Required / అవసరం"),
        // rating: Yup.string().required("Required / అవసరం"),
      }),
    ),
  });

  // Initialize with parsed work history data
  const initialExperiences = parseWorkHistory();

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateToApi = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return "";
    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${mm}-${dd}`;
  };

  const parseDisplayDateToDate = (dateStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split("-");
    if (parts.length !== 3) return new Date();
    const [dd, mm, yyyy] = parts;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  };

  const formik = useFormik({
    initialValues: {
      userType: state.roleName || "",
      stageName: "WORK_HISTORY",
      workerExperienceList:
        initialExperiences.length > 0
          ? initialExperiences
          : [{ ...emptyExperience }],
    },
    validationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
  });

  async function handleSubmit(values, { resetForm, setSubmitting }) {
    try {
      const payload = {
        ...values,
        workerExperienceList: values.workerExperienceList.map((item) => ({
          ...item,
          startDate: formatDateToApi(item.startDate),
          endDate: formatDateToApi(item.endDate),
        })),
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
        // dispatch(login(updatedPayload));
        resetForm();
        onUpdateSuccess();
      } else {
        console.log("API failed =>", response);
      }
    } catch (error) {
      console.log("Submit Error =>", error);
    } finally {
      setSubmitting(false);
    }
  }

  const addExperience = () => {
    formik.setFieldValue("workerExperienceList", [
      ...formik.values.workerExperienceList,
      { ...emptyExperience },
    ]);
  };

  const removeExperience = (index) => {
    const newExperiences = formik.values.workerExperienceList.filter(
      (_, i) => i !== index,
    );
    formik.setFieldValue("workerExperienceList", newExperiences);
  };

  // Toggle skill selection for multi-select
  const toggleSkill = (expIndex, skillId) => {
    formik.setFieldTouched(`workerExperienceList[${expIndex}].skillIds`, true);
    const currentSkillIds =
      formik.values.workerExperienceList[expIndex]?.skillIds || [];

    let newSkillIds;
    if (currentSkillIds.includes(skillId)) {
      newSkillIds = currentSkillIds.filter((id) => id !== skillId);
    } else {
      newSkillIds = [...currentSkillIds, skillId];
    }

    formik.setFieldValue(
      `workerExperienceList[${expIndex}].skillIds`,
      newSkillIds,
    );
  };

  // Get selected skill names for display
  const getSelectedSkillNames = (expIndex) => {
    const skillIds =
      formik.values.workerExperienceList[expIndex]?.skillIds || [];
    return skillsList
      .filter((item) => skillIds.includes(item.id))
      .map((item) => item.skill_name)
      .join(", ");
  };

  const calculateTotalAmount = (index, days, wage) => {
    const daysNum = Number(days || 0);
    const wageNum = Number(wage || 0);

    if (daysNum > 0 && wageNum > 0) {
      formik.setFieldValue(
        `workerExperienceList[${index}].totalAmount`,
        String(daysNum * wageNum),
      );
    } else {
      formik.setFieldValue(`workerExperienceList[${index}].totalAmount`, "");
    }
  };

  const openDatePicker = (field, index) => {
    const currentValue = formik.values.workerExperienceList[index]?.[field];
    formik.setFieldTouched(`workerExperienceList[${index}].${field}`, true);
    setCurrentField(field);
    setCurrentIndex(index);
    setPickerDate(parseDisplayDateToDate(currentValue));
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event?.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    const chosenDate = selectedDate || pickerDate;
    setPickerDate(chosenDate);

    if (currentIndex !== null && currentField) {
      const formatted = formatDate(chosenDate);
      const exp = formik.values.workerExperienceList[currentIndex];

      if (currentField === "startDate") {
        formik.setFieldValue(
          `workerExperienceList[${currentIndex}].startDate`,
          formatted,
        );

        if (exp.endDate) {
          const start = new Date(
            chosenDate.getFullYear(),
            chosenDate.getMonth(),
            chosenDate.getDate(),
          );
          const end = parseDisplayDateToDate(exp.endDate);

          if (end < start) {
            formik.setFieldValue(
              `workerExperienceList[${currentIndex}].endDate`,
              "",
            );
          }
        }
      } else if (currentField === "endDate") {
        if (exp.startDate) {
          const start = parseDisplayDateToDate(exp.startDate);
          const end = new Date(
            chosenDate.getFullYear(),
            chosenDate.getMonth(),
            chosenDate.getDate(),
          );

          if (end < start) {
            Alert.alert(
              "Invalid Date / చెల్లని తేదీ",
              "End date cannot be before Start date / ముగింపు తేదీ ప్రారంభ తేదీకి ముందు ఉండకూడదు",
            );
            return;
          }
        }

        formik.setFieldValue(
          `workerExperienceList[${currentIndex}].endDate`,
          formatted,
        );
      }
    }
  };

  return (
    <FormikProvider value={formik}>
      <ScrollView style={styles.container}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Experience / Work Experience / అనుభవం / పని అనుభవం
          </Text>

          {formik.values.workerExperienceList.map((item, index) => (
            <View key={index} style={styles.experienceCard}>
              <View style={styles.expHeader}>
                <Text style={styles.expTitle}>
                  Experience {index + 1} / అనుభవం {index + 1}
                </Text>

                {formik.values.workerExperienceList.length > 1 && (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => removeExperience(index)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                    <Text style={styles.deleteBtnText}> తొలగించు</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.label}>
                  Employer Name / యజమాని పేరు{" "}
                  {/* <Text style={styles.requiredStar}>*</Text> */}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    formik.touched.workerExperienceList?.[index]?.employeeName &&
                      formik.errors.workerExperienceList?.[index]?.employeeName &&
                      styles.inputError,
                  ]}
                  value={item.employeeName}
                  onChangeText={formik.handleChange(
                    `workerExperienceList[${index}].employeeName`,
                  )}
                  onBlur={formik.handleBlur(
                    `workerExperienceList[${index}].employeeName`,
                  )}
                  placeholder="Enter Employer Name / యజమాని పేరు నమోదు చేయండి"
                />
                {formik.touched.workerExperienceList?.[index]?.employeeName &&
                  formik.errors.workerExperienceList?.[index]?.employeeName && (
                    <Text style={styles.errorText}>
                      {formik.errors.workerExperienceList[index].employeeName}
                    </Text>
                  )}
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.label}>
                  Project Name / ప్రాజెక్ట్ పేరు{" "}
                  {/* <Text style={styles.requiredStar}>*</Text> */}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    formik.touched.workerExperienceList?.[index]?.projectName &&
                      formik.errors.workerExperienceList?.[index]?.projectName &&
                      styles.inputError,
                  ]}
                  value={item.projectName}
                  onChangeText={formik.handleChange(
                    `workerExperienceList[${index}].projectName`,
                  )}
                  onBlur={formik.handleBlur(
                    `workerExperienceList[${index}].projectName`,
                  )}
                  placeholder="Enter Project Name / ప్రాజెక్ట్ పేరు నమోదు చేయండి"
                />
                {formik.touched.workerExperienceList?.[index]?.projectName &&
                  formik.errors.workerExperienceList?.[index]?.projectName && (
                    <Text style={styles.errorText}>
                      {formik.errors.workerExperienceList[index].projectName}
                    </Text>
                  )}
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.label}>
                  Work Place / పని స్థలం{" "}
                  {/* <Text style={styles.requiredStar}>*</Text> */}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    formik.touched.workerExperienceList?.[index]?.workPlace &&
                      formik.errors.workerExperienceList?.[index]?.workPlace &&
                      styles.inputError,
                  ]}
                  value={item.workPlace}
                  onChangeText={formik.handleChange(
                    `workerExperienceList[${index}].workPlace`,
                  )}
                  onBlur={formik.handleBlur(
                    `workerExperienceList[${index}].workPlace`,
                  )}
                  placeholder="Enter Work Place / పని స్థలం నమోదు చేయండి"
                />
                {formik.touched.workerExperienceList?.[index]?.workPlace &&
                  formik.errors.workerExperienceList?.[index]?.workPlace && (
                    <Text style={styles.errorText}>
                      {formik.errors.workerExperienceList[index].workPlace}
                    </Text>
                  )}
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.label}>
                  Work Type / పని రకం
                  {/* <Text style={styles.requiredStar}>*</Text> */}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    formik.touched.workerExperienceList?.[index]?.workType &&
                      formik.errors.workerExperienceList?.[index]?.workType &&
                      styles.inputError,
                  ]}
                  value={item.workType}
                  onChangeText={formik.handleChange(
                    `workerExperienceList[${index}].workType`,
                  )}
                  onBlur={formik.handleBlur(
                    `workerExperienceList[${index}].workType`,
                  )}
                  placeholder="Enter Work Type / పని రకం నమోదు చేయండి"
                />
                {formik.touched.workerExperienceList?.[index]?.workType &&
                  formik.errors.workerExperienceList?.[index]?.workType && (
                    <Text style={styles.errorText}>
                      {formik.errors.workerExperienceList[index].workType}
                    </Text>
                  )}
              </View>

              {/* Skills Multi-select */}
              <View style={styles.inputBlock}>
                <Text style={styles.label}>
                  Skills / నైపుణ్యాలు
                  {/* <Text style={styles.requiredStar}>*</Text> */}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.selectBox,
                    styles.skillsSelectBoxNew,
                    showSkillsDropdown &&
                      currentSkillIndex === index &&
                      styles.skillsSelectBoxOpenNew,
                    formik.touched.workerExperienceList?.[index]?.skillIds &&
                      formik.errors.workerExperienceList?.[index]?.skillIds &&
                      styles.inputError,
                  ]}
                  onPress={() => {
                    formik.setFieldTouched(
                      `workerExperienceList[${index}].skillIds`,
                      true,
                    );
                    setCurrentSkillIndex(
                      currentSkillIndex === index ? null : index,
                    );
                    setShowSkillsDropdown(currentSkillIndex !== index);
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.skillsSelectedTextNew,
                      { color: getSelectedSkillNames(index) ? "#000" : "#999" },
                    ]}
                  >
                    {getSelectedSkillNames(index) ||
                      "Select Skills / నైపుణ్యాలను ఎంచుకోండి"}
                  </Text>

                  <Ionicons
                    name={
                      showSkillsDropdown && currentSkillIndex === index
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={20}
                    color="#333"
                  />
                </TouchableOpacity>

                {showSkillsDropdown && currentSkillIndex === index && (
                  <View style={[styles.dropdownBox, styles.skillsDropdownBoxNew]}>
                    {skillsList.map((skill, idx) => {
                      const selected = formik.values.workerExperienceList[
                        index
                      ]?.skillIds?.includes(skill.id);

                      return (
                        <TouchableOpacity
                          key={skill.id}
                          style={[
                            styles.skillItem,
                            styles.skillsDropdownItemNew,
                            selected && styles.skillsDropdownItemSelectedNew,
                            idx === skillsList.length - 1 &&
                              styles.skillsDropdownLastItemNew,
                          ]}
                          onPress={() => toggleSkill(index, skill.id)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.skillText,
                              styles.skillsDropdownTextNew,
                              selected && styles.skillsDropdownTextSelectedNew,
                            ]}
                          >
                            {skill.skill_name}
                          </Text>

                          <Ionicons
                            name={selected ? "checkbox" : "square-outline"}
                            size={22}
                            color={selected ? "#1e3a5f" : "#999"}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {formik.touched.workerExperienceList?.[index]?.skillIds &&
                  formik.errors.workerExperienceList?.[index]?.skillIds && (
                    <Text style={styles.errorText}>
                      {formik.errors.workerExperienceList[index].skillIds}
                    </Text>
                  )}
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.label}>
                  Task Description / పని వివరణ{" "}
                  {/* <Text style={styles.requiredStar}>*</Text> */}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    formik.touched.workerExperienceList?.[index]
                      ?.taskDescription &&
                      formik.errors.workerExperienceList?.[index]
                        ?.taskDescription &&
                      styles.inputError,
                  ]}
                  value={item.taskDescription}
                  onChangeText={formik.handleChange(
                    `workerExperienceList[${index}].taskDescription`,
                  )}
                  onBlur={formik.handleBlur(
                    `workerExperienceList[${index}].taskDescription`,
                  )}
                  placeholder="Enter Task Description / పని వివరణ నమోదు చేయండి"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                {formik.touched.workerExperienceList?.[index]?.taskDescription &&
                  formik.errors.workerExperienceList?.[index]
                    ?.taskDescription && (
                    <Text style={styles.errorText}>
                      {formik.errors.workerExperienceList[index].taskDescription}
                    </Text>
                  )}
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.label}>
                  Start Date / ప్రారంభ తేదీ{" "}
                  {/* <Text style={styles.requiredStar}>*</Text> */}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.input,
                    formik.touched.workerExperienceList?.[index]?.startDate &&
                      formik.errors.workerExperienceList?.[index]?.startDate &&
                      styles.inputError,
                  ]}
                  onPress={() => openDatePicker("startDate", index)}
                >
                  <Text style={{ color: item.startDate ? "#000" : "#999" }}>
                    {item.startDate ||
                      "Select Start Date / ప్రారంభ తేదీని ఎంచుకోండి"}
                  </Text>
                </TouchableOpacity>
                {formik.touched.workerExperienceList?.[index]?.startDate &&
                  formik.errors.workerExperienceList?.[index]?.startDate && (
                    <Text style={styles.errorText}>
                      {formik.errors.workerExperienceList[index].startDate}
                    </Text>
                  )}
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.label}>
                  End Date / ముగింపు తేదీ{" "}
                  {/* <Text style={styles.requiredStar}>*</Text> */}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.input,
                    formik.touched.workerExperienceList?.[index]?.endDate &&
                      formik.errors.workerExperienceList?.[index]?.endDate &&
                      styles.inputError,
                  ]}
                  onPress={() => openDatePicker("endDate", index)}
                >
                  <Text style={{ color: item.endDate ? "#000" : "#999" }}>
                    {item.endDate || "Select End Date / ముగింపు తేదీని ఎంచుకోండి"}
                  </Text>
                </TouchableOpacity>
                {formik.touched.workerExperienceList?.[index]?.endDate &&
                  formik.errors.workerExperienceList?.[index]?.endDate && (
                    <Text style={styles.errorText}>
                      {formik.errors.workerExperienceList[index].endDate}
                    </Text>
                  )}
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.label}>
                  Days Worked / పని చేసిన రోజులు{" "}
                  {/* <Text style={styles.requiredStar}>*</Text> */}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    formik.touched.workerExperienceList?.[index]?.daysWorked &&
                      formik.errors.workerExperienceList?.[index]?.daysWorked &&
                      styles.inputError,
                  ]}
                  value={item.daysWorked}
                  onChangeText={(text) => {
                    formik.setFieldValue(
                      `workerExperienceList[${index}].daysWorked`,
                      text,
                    );
                    calculateTotalAmount(index, text, item.dailyWage);
                  }}
                  onBlur={formik.handleBlur(
                    `workerExperienceList[${index}].daysWorked`,
                  )}
                  keyboardType="numeric"
                  placeholder="Enter Days Worked / పని చేసిన రోజులు నమోదు చేయండి"
                />
                {formik.touched.workerExperienceList?.[index]?.daysWorked &&
                  formik.errors.workerExperienceList?.[index]?.daysWorked && (
                    <Text style={styles.errorText}>
                      {formik.errors.workerExperienceList[index].daysWorked}
                    </Text>
                  )}
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.label}>
                  Daily Wage / రోజువారీ వేతనం{" "}
                  {/* <Text style={styles.requiredStar}>*</Text> */}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    formik.touched.workerExperienceList?.[index]?.dailyWage &&
                      formik.errors.workerExperienceList?.[index]?.dailyWage &&
                      styles.inputError,
                  ]}
                  value={item.dailyWage}
                  onChangeText={(text) => {
                    formik.setFieldValue(
                      `workerExperienceList[${index}].dailyWage`,
                      text,
                    );
                    calculateTotalAmount(index, item.daysWorked, text);
                  }}
                  onBlur={formik.handleBlur(
                    `workerExperienceList[${index}].dailyWage`,
                  )}
                  keyboardType="numeric"
                  placeholder="Enter Daily Wage / రోజువారీ వేతనం నమోదు చేయండి"
                />
                {formik.touched.workerExperienceList?.[index]?.dailyWage &&
                  formik.errors.workerExperienceList?.[index]?.dailyWage && (
                    <Text style={styles.errorText}>
                      {formik.errors.workerExperienceList[index].dailyWage}
                    </Text>
                  )}
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.label}>
                  Total Amount / మొత్తం మొత్తం{" "}
                  {/* <Text style={styles.requiredStar}>*</Text> */}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.readOnlyInput,
                    formik.touched.workerExperienceList?.[index]?.totalAmount &&
                      formik.errors.workerExperienceList?.[index]?.totalAmount &&
                      styles.inputError,
                  ]}
                  value={item.totalAmount}
                  editable={false}
                  placeholder="Total Amount / మొత్తం మొత్తం"
                />
                {formik.touched.workerExperienceList?.[index]?.totalAmount &&
                  formik.errors.workerExperienceList?.[index]?.totalAmount && (
                    <Text style={styles.errorText}>
                      {formik.errors.workerExperienceList[index].totalAmount}
                    </Text>
                  )}
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.label}>
                  Payment Status / చెల్లింపు స్థితి{" "}
                  {/* <Text style={styles.requiredStar}>*</Text> */}
                </Text>
                <View
                  style={[
                    styles.selectBox,
                    formik.touched.workerExperienceList?.[index]?.paymentStatus &&
                      formik.errors.workerExperienceList?.[index]
                        ?.paymentStatus &&
                      styles.inputError,
                  ]}
                >
                  <Picker
                    style={styles.input}
                    selectedValue={item.paymentStatus}
                    onValueChange={(itemValue) => {
                      formik.setFieldTouched(
                        `workerExperienceList[${index}].paymentStatus`,
                        true,
                      );
                      formik.setFieldValue(
                        `workerExperienceList[${index}].paymentStatus`,
                        itemValue,
                      );
                    }}
                  >
                    <Picker.Item
                      label="Select Payment Status / చెల్లింపు స్థితిని ఎంచుకోండి"
                      value=""
                    />
                    <Picker.Item label="Paid / చెల్లించబడింది" value="paid" />
                    <Picker.Item label="Pending / పెండింగ్" value="pending" />
                    <Picker.Item label="Partial / పాక్షికం" value="partial" />
                  </Picker>
                </View>
                {formik.touched.workerExperienceList?.[index]?.paymentStatus &&
                  formik.errors.workerExperienceList?.[index]?.paymentStatus && (
                    <Text style={styles.errorText}>
                      {formik.errors.workerExperienceList[index].paymentStatus}
                    </Text>
                  )}
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.label}>
                  Remarks / వ్యాఖ్యలు
                  {/* <Text style={styles.requiredStar}>*</Text> */}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    formik.touched.workerExperienceList?.[index]?.remarks &&
                      formik.errors.workerExperienceList?.[index]?.remarks &&
                      styles.inputError,
                  ]}
                  value={item.remarks}
                  onChangeText={formik.handleChange(
                    `workerExperienceList[${index}].remarks`,
                  )}
                  onBlur={formik.handleBlur(
                    `workerExperienceList[${index}].remarks`,
                  )}
                  placeholder="Enter Remarks / వ్యాఖ్యలు నమోదు చేయండి"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                {formik.touched.workerExperienceList?.[index]?.remarks &&
                  formik.errors.workerExperienceList?.[index]?.remarks && (
                    <Text style={styles.errorText}>
                      {formik.errors.workerExperienceList[index].remarks}
                    </Text>
                  )}
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.label}>
                  Rating / రేటింగ్
                  {/* <Text style={styles.requiredStar}>*</Text> */}
                </Text>
                <View
                  style={[
                    styles.selectBox,
                    formik.touched.workerExperienceList?.[index]?.rating &&
                      formik.errors.workerExperienceList?.[index]?.rating &&
                      styles.inputError,
                  ]}
                >
                  <Picker
                    style={styles.input}
                    selectedValue={item.rating}
                    onValueChange={(itemValue) => {
                      formik.setFieldTouched(
                        `workerExperienceList[${index}].rating`,
                        true,
                      );
                      formik.setFieldValue(
                        `workerExperienceList[${index}].rating`,
                        itemValue,
                      );
                    }}
                  >
                    <Picker.Item
                      label="Select Rating / రేటింగ్ ఎంచుకోండి"
                      value=""
                    />
                    <Picker.Item label="1" value="1" />
                    <Picker.Item label="2" value="2" />
                    <Picker.Item label="3" value="3" />
                    <Picker.Item label="4" value="4" />
                    <Picker.Item label="5" value="5" />
                  </Picker>
                </View>
                {formik.touched.workerExperienceList?.[index]?.rating &&
                  formik.errors.workerExperienceList?.[index]?.rating && (
                    <Text style={styles.errorText}>
                      {formik.errors.workerExperienceList[index].rating}
                    </Text>
                  )}
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addMoreBtn} onPress={addExperience}>
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.addMoreBtnText}>
              Add Experience / అనుభవాన్ని జోడించండి
            </Text>
          </TouchableOpacity>

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

          {showDatePicker && (
            <DateTimePicker
              value={pickerDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>
      </ScrollView>
    </FormikProvider>
  );
};