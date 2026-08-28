import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
  Button,
  Modal,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  commonAPICall,
  EMPLOYEEREG,
  EMPLOYEEREGOTP,
  GENERATE_CAPTCHA,
  GETDISTSAPP,
  GETMANDALSAPP,
  GETVILLAGESAPP,
  LOGIN_END_POINT,
  LOGOUT_END_POINT,
  myAxios,
  myAxiosLogin,
} from "../utils/utils";
import { useDispatch } from "react-redux";
import { login } from "../actions";
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from "../utils/showToast";
import amblem from "../../assets/labour_log.png";
import labour_img from "../../assets/labour.png";
import React, { useEffect, useRef, useState } from "react";
import { ErrorMessage, useFormik } from "formik";
import * as Yup from "yup";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

const { width } = Dimensions.get("window");

const LoginCommon = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [deptCaptcha, setDeptCaptcha] = useState("667938");
  const [storedCaptchaId, setStoredCaptchaId] = useState("b116c030-794a-4a3c-b0a3-02b4ea72c7df");
  const [captchaImage, setCaptchaImage] = useState("data:image/png;base64,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");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enableBiometric, setEnableBiometric] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState(null);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Single captcha instance maintained in frontend
  const [currentCaptcha, setCurrentCaptcha] = useState({
    text: "",
    id: "",
  });

  const [selectedUserType, setSelectedUserType] = useState("");
  const [selectedAction, setSelectedAction] = useState("");

  const [errors, setErrors] = useState({
    username: "",
    password: "",
    deptCaptcha: "",
  });

  const dispatch = useDispatch();

  // Check biometric support and load saved credentials on mount
  useEffect(() => {
    checkBiometricSupportAndLoad();
  }, []);

  const checkBiometricSupportAndLoad = async () => {
    try {
      // Check biometric support
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricSupported(compatible && enrolled);

      // Load saved credentials
      const savedUser = await AsyncStorage.getItem("biometric_user");
      if (savedUser) {
        const credentials = JSON.parse(savedUser);
        setSavedCredentials(credentials);
        
        // If biometric is supported and credentials exist, auto-prompt
        if (compatible && enrolled && credentials) {
          // Generate captcha first
          await generateFreshCaptcha();
          // Then show biometric prompt after a small delay
          setTimeout(() => {
            setShowBiometricPrompt(true);
            handleBiometricLogin();
          }, 500);
        } else {
          // Generate captcha for manual login
          await generateFreshCaptcha();
        }
      } else {
        // Generate captcha for manual login
        await generateFreshCaptcha();
      }
    } catch (error) {
      console.log("Biometric check error:", error);
      await generateFreshCaptcha();
    } finally {
      setIsFirstLoad(false);
    }
  };

  // Generate a fresh captcha and store it in frontend state
  const generateFreshCaptcha = async () => {
    try {
      const response = await commonAPICall(
        GENERATE_CAPTCHA,
        {},
        "get",
        dispatch
      );
      if (response?.data) {
        const newCaptcha = {
          text: response.data.captcha || "",
          id: response.data.captchaId || "",
        };
        setCurrentCaptcha(newCaptcha);
        setCaptchaImage(response.data.captcha || "");
        setStoredCaptchaId(response.data.captchaId || "");
        setDeptCaptcha(""); // Clear input
        console.log("Fresh captcha generated:", newCaptcha.id);
        return newCaptcha;
      }
    } catch (error) {
      console.log("Captcha generation error:", error);
    }
    return null;
  };

  const loadSavedCredentials = async () => {
    try {
      const savedUser = await AsyncStorage.getItem("biometric_user");
      if (savedUser) {
        setSavedCredentials(JSON.parse(savedUser));
      }
    } catch (error) {
      console.log("Error loading saved credentials:", error);
    }
  };

  const saveCredentialsForBiometric = async (username, password) => {
    try {
      await AsyncStorage.setItem(
        "biometric_user",
        JSON.stringify({ username, password })
      );
      setSavedCredentials({ username, password });
      showSuccessToast("Biometric login enabled! You can now use fingerprint to login.");
    } catch (error) {
      console.log("Error saving credentials:", error);
    }
  };

  const handleBiometricLogin = async () => {
    if (!savedCredentials) {
      setShowBiometricPrompt(false);
      return;
    }

    setIsBiometricLoading(true);

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Scan your fingerprint to login",
        fallbackLabel: "Use Passcode",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Use the current captcha stored in frontend
        await performBiometricLogin(
          savedCredentials.username,
          savedCredentials.password
        );
      } else {
        if (result.error !== "user_cancel") {
          showErrorToast("Biometric authentication failed. Please try again.");
        }
        // User cancelled - show manual login
        setShowBiometricPrompt(false);
      }
    } catch (error) {
      console.log("Authentication error:", error);
      showErrorToast("Authentication failed. Please try again.");
      setShowBiometricPrompt(false);
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const performBiometricLogin = async (username, password) => {
    setLoading(true);

    try {
      // Use the current captcha from frontend state
      let captchaText = currentCaptcha.text;
      let captchaId = currentCaptcha.id;

      // If no captcha available, generate one
      if (!captchaText || !captchaId) {
        const newCaptcha = await generateFreshCaptcha();
        if (newCaptcha) {
          captchaText = newCaptcha.text;
          captchaId = newCaptcha.id;
        }
      }

      // If still no captcha, generate one synchronously
      if (!captchaText || !captchaId) {
        const response = await commonAPICall(
          GENERATE_CAPTCHA,
          {},
          "get",
          dispatch
        );
        if (response?.data) {
          captchaText = response.data.captcha || "";
          captchaId = response.data.captchaId || "";
          setCurrentCaptcha({ text: captchaText, id: captchaId });
          setCaptchaImage(captchaText);
          setStoredCaptchaId(captchaId);
        }
      }

      const loginValues = {
        username: username.trim(),
        password: encodeBase64(password),
        deptCaptcha: captchaText,
        storedCaptchaId: captchaId,
        latitude: null,
        longitude: null,
        loginSource: "mobile",
        loginType: "biometric",
      };

      console.log("Biometric login with captcha ID:", captchaId);

      let response;
      try {
        response = await myAxiosLogin.post(LOGIN_END_POINT, loginValues);
      } catch (firstError) {
        // If captcha failed, generate new one and retry
        if (firstError.response?.data?.message?.toLowerCase().includes("captcha")) {
          console.log("Captcha failed, generating new one...");
          const newCaptcha = await generateFreshCaptcha();
          
          if (newCaptcha) {
            const retryValues = {
              ...loginValues,
              deptCaptcha: newCaptcha.text,
              storedCaptchaId: newCaptcha.id,
            };
            response = await myAxiosLogin.post(LOGIN_END_POINT, retryValues);
          } else {
            throw firstError;
          }
        } else {
          throw firstError;
        }
      }

      if (response?.status === 200) {
        const payload = {
          isLoggedIn: true,
          isDefaultPassword: response.data.isDefaultPassword,
          isProfileUpdated: response.data.isProfileUpdated,
          officerName: response.data.officerName,
          mobile: response.data.mobile,
          parents: response.data.parents,
          services: response.data.services,
          roleId: response.data.roleId,
          userId: response.data.userId,
          username: response.data.username,
          token: response.data.token,
          roleName: response.data.roleName,
          photoPath: response.data.photoPath,
          lastLoginTime: response.data.lastLoginTime,
          uuid: response.data.uuid,
          lastLogoutTime: response.data.lastLogoutTime,
          lastFailureAttemptTime: response.data.lastFailureAttemptTime,
          passwordSinceUpdated: response.data.passwordSinceUpdated,
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          loginLocation: response.data.location,
        };

        dispatch(login(payload));

        const currentTime = new Date().getHours();
        let welcomeMsg = "";

        if (currentTime >= 5 && currentTime < 12) {
          welcomeMsg = "Good morning! Authenticated with biometrics successfully!";
        } else if (currentTime >= 12 && currentTime < 18) {
          welcomeMsg = "Good afternoon! Welcome back!";
        } else {
          welcomeMsg = "Good evening! Welcome back!";
        }

        showSuccessToast(welcomeMsg);
        setShowBiometricPrompt(false);
        navigation.navigate("HOME");
      } else {
        showErrorToast("Login failed. Please try again with password.");
        setShowBiometricPrompt(false);
      }
    } catch (error) {
      console.log("Error during biometric authentication:", error);
      
      if (error.response) {
        const errorMessage = error.response?.data?.message || "Login failed";
        if (errorMessage.toLowerCase().includes("captcha")) {
          showErrorToast("Captcha validation failed. Please try again.");
          await generateFreshCaptcha();
        } else {
          showErrorToast(errorMessage);
        }
      } else {
        showErrorToast(error.message || "Something went wrong");
      }
      setShowBiometricPrompt(false);
    } finally {
      setLoading(false);
    }
  };

  const encodeBase64 = (value) => {
    try {
      if (typeof btoa === "function") return btoa(value);
      if (global?.btoa) return global.btoa(value);
      return value;
    } catch {
      return value;
    }
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setDeptCaptcha("");
    setShowPassword(false);
    setErrors({
      username: "",
      password: "",
      deptCaptcha: "",
    });
  };

  const goBackToRoleSelection = () => {
    setSelectedUserType("");
    setSelectedAction("");
    resetForm();
  };

  const goBackToActionSelection = () => {
    setSelectedAction("");
    resetForm();
  };

  const validateForm = () => {
    const newErrors = {
      username: "",
      password: "",
      deptCaptcha: "",
    };

    let valid = true;

    if (!username.trim()) {
      newErrors.username = "Username is required";
      valid = false;
    } else if (username.trim().length < 4) {
      newErrors.username = "Username must be at least 4 characters";
      valid = false;
    } else if (username.trim().length > 18) {
      newErrors.username = "Username must be less than 18 characters";
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (password.trim().length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    if (!deptCaptcha.trim()) {
      newErrors.deptCaptcha = "Captcha is required";
      valid = false;
    } else if (deptCaptcha.trim().length !== 6) {
      newErrors.deptCaptcha = "Captcha must be exactly 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const generateCaptcha = async () => {
    // This will refresh the captcha in UI
    const newCaptcha = await generateFreshCaptcha();
    if (newCaptcha) {
      setDeptCaptcha(""); // Clear input when new captcha is generated
    }
  };

  const logoutUser = async () => {
    try {
      await myAxios.get(`${LOGOUT_END_POINT}?type=HOMEPAGE`);
    } catch (error) {
      console.log("Logout skipped:", error?.message);
    }
  };

  useEffect(() => {
    logoutUser();
    // Initial captcha generation will be handled by checkBiometricSupportAndLoad
  }, []);

  const getLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);

    // Use the current captcha from frontend state
    const captchaText = deptCaptcha.trim() || currentCaptcha.text;
    const captchaId = storedCaptchaId || currentCaptcha.id;

    const values = {
      username: username.trim(),
      password: encodeBase64(password),
      deptCaptcha: captchaText,
      storedCaptchaId: captchaId,
      latitude: null,
      longitude: null,
      loginSource: "mobile",
    };

    try {
      const response = await myAxiosLogin.post(LOGIN_END_POINT, values);

      if (response.status === 200) {
        const payload = {
          isLoggedIn: true,
          isDefaultPassword: response.data.isDefaultPassword,
          isProfileUpdated: response.data.isProfileUpdated,
          officerName: response.data.officerName,
          mobile: response.data.mobile,
          parents: response.data.parents,
          services: response.data.services,
          roleId: response.data.roleId,
          userId: response.data.userId,
          username: response.data.username,
          token: response.data.token,
          roleName: response.data.roleName,
          photoPath: response.data.photoPath,
          lastLoginTime: response.data.lastLoginTime,
          uuid: response.data.uuid,
          lastLogoutTime: response.data.lastLogoutTime,
          lastFailureAttemptTime: response.data.lastFailureAttemptTime,
          passwordSinceUpdated: response.data.passwordSinceUpdated,
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          loginLocation: response.data.location,
        };

        dispatch(login(payload));

        if (enableBiometric) {
          await saveCredentialsForBiometric(username.trim(), password);
        }

        const currentTime = new Date().getHours();
        let welcomeMsg = "";

        if (currentTime >= 5 && currentTime < 12) {
          welcomeMsg =
            "Good morning! A book is a window to the world—start your day with knowledge!";
        } else if (currentTime >= 12 && currentTime < 18) {
          welcomeMsg =
            "Good afternoon! Dive into a book and let your imagination take you on an adventure!";
        } else {
          welcomeMsg =
            "Good evening! End your day with the wisdom of a good book!";
        }

        showSuccessToast(welcomeMsg);

        if (
          parseInt(response?.data?.passwordSinceUpdated) >= 85 &&
          parseInt(response?.data?.passwordSinceUpdated) < 90
        ) {
          showInfoToast(
            `Your password will expire in ${
              90 - response.data.passwordSinceUpdated
            } days. Please update it soon.`
          );
        }

        navigation.navigate("HOME");
      } else {
        showErrorToast("Please enter valid credentials");
      }
    } catch (error) {
      if (error.response) {
        // If captcha failed, generate new one
        if (error.response?.data?.message?.toLowerCase().includes("captcha")) {
          await generateFreshCaptcha();
          showErrorToast("Captcha expired. Please try again.");
        } else {
          setCaptchaImage(error.response?.data?.captcha || "");
          setStoredCaptchaId(error.response?.data?.captchaId || "");
          showErrorToast(
            error.response?.data?.message || "Please enter valid credentials"
          );
        }
      } else {
        showErrorToast(error.message || "Something went wrong");
      }

      console.log("Error during authentication:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    if (selectedUserType === "worker") {
      navigation.navigate("RegisterWorker");
    } else if (selectedUserType === "employer") {
      navigation.navigate("RegisterEmployer");
    } else if (selectedUserType === "agency") {
      navigation.navigate("AddAgency");
    }
  };

  const renderRoleSelection = () => (
    <View style={styles.card}>
      <View style={styles.cardGlow} />

      <View style={styles.logoWrapper}>
        <View style={styles.logoOuterRing}>
          <View style={styles.logoCircle}>
            <Ionicons name="briefcase-outline" size={34} color="#fff" />
          </View>
        </View>
      </View>

      <Text style={styles.deptName}>Welcome / స్వాగతం</Text>
      <Text style={styles.subtitle}>
        Connecting Workers and Employers Digitally / కార్మికులు మరియు యజమానులను
        డిజిటల్‌గా అనుసంధానిస్తున్నాము
      </Text>

      <TouchableOpacity
        style={styles.optionCard}
        onPress={() => setSelectedUserType("worker")}
        activeOpacity={0.85}
      >
        <View style={styles.optionIconWrap}>
          <Ionicons name="person-outline" size={26} color="#1e3a5f" />
        </View>
        <View style={styles.optionTextWrap}>
          <Text style={styles.optionTitle}>
            I am a Worker{"\n"} నేను కార్మికుడు
          </Text>{" "}
        </View>
        <Ionicons name="chevron-forward" size={22} color="#1e3a5f" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionCard}
        onPress={() => setSelectedUserType("employer")}
        activeOpacity={0.85}
      >
        <View style={styles.optionIconWrap}>
          <Ionicons name="business-outline" size={26} color="#1e3a5f" />
        </View>
        <View style={styles.optionTextWrap}>
          <Text style={styles.optionTitle}>
            I am an Employer {"\n"} నేను యజమాని
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#1e3a5f" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.optionCard}
        onPress={() => setSelectedUserType("agency")}
        activeOpacity={0.85}
      >
        <View style={styles.optionIconWrap}>
          <Ionicons name="business-outline" size={26} color="#1e3a5f" />
        </View>
        <View style={styles.optionTextWrap}>
          <Text style={styles.optionTitle}>
            I am an Agency {"\n"} నేను ఒక సంస్థను
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#1e3a5f" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.optionCard,
          {
            backgroundColor: "#fff",
            borderRadius: 10,
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          },
        ]}
        onPress={() => Linking.openURL("https://eshram.gov.in/")}
        activeOpacity={0.85}
      >
        <View style={styles.optionIconWrap}>
          <Ionicons name="business-outline" size={26} color="#1e3a5f" />
        </View>
        <View style={styles.optionTextWrap}>
          <Text style={styles.optionTitle}>Quick Access/త్వరిత ప్రవేశం</Text>
          <TouchableOpacity
            style={styles.eshramButton}
            onPress={() => Linking.openURL("https://eshram.gov.in/")}
          >
            <Ionicons name="document-text-outline" size={20} color="#fff" />
            <Text style={styles.eshramText}>e-Shram Registration</Text>{" "}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderActionSelection = () => (
    <View style={styles.card}>
      <View style={styles.cardGlow} />

      <TouchableOpacity
        style={styles.backBtn}
        onPress={goBackToRoleSelection}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={20} color="#1e3a5f" />
        <Text style={styles.backBtnText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.logoWrapper}>
        <View style={styles.logoOuterRing}>
          <View style={styles.logoCircle}>
            <Ionicons
              name={
                selectedUserType === "worker"
                  ? "person-outline"
                  : "business-outline"
              }
              size={34}
              color="#fff"
            />
          </View>
        </View>
      </View>

      <Text style={styles.title}>
        మీరు ఇప్పటికే{" "}
        {selectedUserType === "worker" ? "కార్మికుడిగా" : "యజమానిగా"} నమోదు
        అయ్యారా?
      </Text>

      <TouchableOpacity
        style={styles.actionButtonSecondary}
        onPress={handleRegister}
        activeOpacity={0.85}
      >
        <Ionicons name="person-add-outline" size={20} color="#1e3a5f" />
        <Text style={styles.actionButtonSecondaryText}>
          కొత్త వినియోగదారు{"\n"}మొదటి సారి నమోదు చేసుకోండి
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButtonPrimary}
        onPress={() => {
          setSelectedAction("login");
          generateCaptcha();
        }}
        activeOpacity={0.85}
      >
        <Ionicons name="log-in-outline" size={20} color="#fff" />
        <Text style={styles.actionButtonPrimaryText}>
          ఇప్పటికే ఉన్న వినియోగదారు{"\n"}ఫోన్ నంబర్‌తో లాగిన్ అవ్వండి
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoginForm = () => (
    <View style={styles.card}>
      <View style={styles.cardGlow} />

      <TouchableOpacity
        style={styles.backBtn}
        onPress={goBackToActionSelection}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={20} color="#1e3a5f" />
        <Text style={styles.backBtnText}>Back / వెనక్కి</Text>
      </TouchableOpacity>

      <View style={styles.logoWrapper}>
        <View style={styles.logoOuterRing}>
          <View style={styles.logoCircle}>
            <Ionicons
              name={
                selectedUserType === "worker"
                  ? "person-outline"
                  : "business-outline"
              }
              size={34}
              color="#fff"
            />
          </View>
        </View>
      </View>

      <Text style={styles.deptName}>Digital Labour Chowk</Text>

      <Text style={styles.title}>
        Login{" "}
        {selectedUserType === "worker"
          ? "Worker / కార్మికుడు"
          : selectedUserType === "agency"
          ? "Agency / ఏజెన్సీ"
          : "Employer / యజమాని"}
      </Text>

      <Text style={styles.subtitle}>
        Sign in to access your{" "}
        {selectedUserType === "worker"
          ? "Worker / కార్మికుడు"
          : selectedUserType === "agency"
          ? "Agency / ఏజెన్సీ"
          : "Employer / యజమాని"}{" "}
        account
      </Text>

      {/* USERNAME */}
      <View style={styles.fieldBlock}>
        <View
          style={[
            styles.inputWrapper,
            errors.username ? styles.inputWrapperError : null,
          ]}
        >
          <Ionicons
            name="person-outline"
            size={20}
            color="#5f6f94"
            style={styles.leftIcon}
          />
          <TextInput
            placeholder="Enter User ID / యూజర్ ఐడి నమోదు చేయండి"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              if (errors.username) setErrors({ ...errors, username: "" });
            }}
            maxLength={18}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            blurOnSubmit={false}
          />
        </View>
        {errors.username ? (
          <Text style={styles.errorText}>{errors.username}</Text>
        ) : null}
      </View>

      {/* PASSWORD */}
      <View style={styles.fieldBlock}>
        <View
          style={[
            styles.inputWrapper,
            errors.password ? styles.inputWrapperError : null,
          ]}
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#5f6f94"
            style={styles.leftIcon}
          />
          <TextInput
            placeholder="Enter Password / పాస్‌వర్డ్ నమోదు చేయండి"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({ ...errors, password: "" });
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={22}
              color="#1e3a5f"
            />
          </TouchableOpacity>
        </View>
        {errors.password ? (
          <Text style={styles.errorText}>{errors.password}</Text>
        ) : null}
      </View>

      {/* CAPTCHA */}
      <View style={styles.fieldBlock}>
        <View style={styles.captchaRow}>
          <View
            style={[
              styles.captchaInputWrapper,
              errors.deptCaptcha ? styles.inputWrapperError : null,
            ]}
          >
            <TextInput
              placeholder="Captcha / క్యాప్చా"
              placeholderTextColor="#94a3b8"
              style={styles.input}
              value={deptCaptcha}
              onChangeText={(text) => {
                setDeptCaptcha(text);
                if (errors.deptCaptcha) {
                  setErrors({ ...errors, deptCaptcha: "" });
                }
              }}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <View style={styles.captchaBox}>
            {captchaImage ? (
              <Image
                source={{ uri: captchaImage }}
                style={styles.captchaImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.captchaPlaceholderText}>
                Captcha / క్యాప్చా
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={generateCaptcha}
            style={styles.refreshBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={22} color="#1e3a5f" />
          </TouchableOpacity>
        </View>

        {errors.deptCaptcha ? (
          <Text style={styles.errorText}>{errors.deptCaptcha}</Text>
        ) : null}
      </View>

      {/* Enable Biometric Checkbox */}
      {/* {isBiometricSupported && (
        <View style={styles.biometricToggleContainer}>
          <TouchableOpacity
            style={styles.biometricToggle}
            onPress={() => setEnableBiometric(!enableBiometric)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.checkbox,
                enableBiometric && styles.checkboxChecked,
              ]}
            >
              {enableBiometric && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <View style={styles.biometricToggleTextContainer}>
              <Text style={styles.biometricToggleText}>
                Enable Fingerprint Login for next time
              </Text>
              <Text style={styles.biometricToggleSubText}>
                Save credentials securely for faster login
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )} */}

      {/* LOGIN BUTTON */}
      <TouchableOpacity
        style={[
          styles.loginButton,
          loading ? styles.loginButtonDisabled : null,
        ]}
        onPress={getLogin}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.loginText}>
              లాగిన్ చేయండి{" "}
            </Text>
            <Ionicons
              name="arrow-forward-outline"
              size={20}
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          </>
        )}
      </TouchableOpacity>

      {/* BIOMETRIC LOGIN BUTTON - Only show if user has saved credentials and biometric is supported */}
      {/* {isBiometricSupported && savedCredentials && (
        <TouchableOpacity
          style={[
            styles.biometricButton,
            isBiometricLoading && styles.biometricButtonDisabled,
          ]}
          onPress={handleBiometricLogin}
          disabled={isBiometricLoading}
          activeOpacity={0.8}
        >
          {isBiometricLoading ? (
            <ActivityIndicator color="#0b5db3" />
          ) : (
            <>
              <Ionicons name="finger-print-outline" size={24} color="#0b5db3" />
              <Text style={styles.biometricButtonText}>
                Login with Fingerprint
              </Text>
            </>
          )}
        </TouchableOpacity>
      )} */}
    </View>
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a5f" />

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 20}
        enabled
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <Image source={labour_img} style={styles.backgroundImage} />

          <View style={styles.overlay} />
          <View style={styles.backgroundLayerTop} />
          <View style={styles.backgroundLayerMiddle} />
          <View style={styles.topDecorationOne} />
          <View style={styles.topDecorationTwo} />
          <View style={styles.bottomDecoration} />
          <View style={styles.bottomDecorationTwo} />

          <View style={styles.heroImageWrapper}>
            <Image
              source={labour_img}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.heroImageOverlay}>
              <Image
                source={amblem}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
              <Text style={styles.heroImageText}>
                Digital Labour Chowk{"\n"}డిజిటల్ లేబర్ చౌక్
              </Text>
              <Text style={styles.heroImageSubText}>
                Government of Andhra Pradesh
              </Text>
            </View>
          </View>

          {!selectedUserType
            ? renderRoleSelection()
            : selectedUserType === "agency"
            ? renderLoginForm()
            : !selectedAction
            ? renderActionSelection()
            : renderLoginForm()}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const CommonRegistrationForm = ({ navigation, type = "worker" }) => {
  const isWorker = type === "DLC Worker";
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  
  // Location state
  const [dists, setDists] = useState([]);
  const [mandal, setMandal] = useState([]);
  const [village, setVillage] = useState([]);

  const otpInputs = useRef([]);
  const dispatch = useDispatch();

  const validationSchema = Yup.object().shape({
    fullName: Yup.string().required("Full name is required"),
    mobileNumber: Yup.string()
      .matches(/^[0-9]{10}$/, "10 digits required")
      .required("Mobile number is required"),
    password: Yup.string()
      .min(6, "Min 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
    otp: Yup.string().matches(/^[0-9]{6}$/, "6 digits required"),
    agreeTerms: Yup.boolean().oneOf([true], "Required").required("Required"),
    // Location validation
    district: Yup.string().required("Required / అవసరం"),
    mandal: Yup.string().required("Required / అవసరం"),
    village: Yup.string().required("Required / అవసరం"),
    plotOrHouseNumber: Yup.string().required("Required / అవసరం"),
    landmark: Yup.string().required("Required / అవసరం"),
    pincode: Yup.string().required("Required / అవసరం"),
    latitude: Yup.string().required("Required / అవసరం"),
    longitude: Yup.string().required("Required / అవసరం"),
  });

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      mobileNumber: "",
      password: "",
      confirmPassword: "",
      otp: "",
      userType: type,
      agreeTerms: false,
      registrationId: "",
      // Location fields
      district: "",
      mandal: "",
      village: "",
      plotOrHouseNumber: "",
      landmark: "",
      pincode: "",
      latitude: "",
      longitude: "",
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  // Get districts on component mount
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

  // Get location on mount
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

  async function handleSubmit(values, { setSubmitting, resetForm }) {
    setLoading(true);
    if (!values.otp || values.otp.length !== 6) {
      showErrorToast("Please enter valid 6-digit OTP");
      setLoading(false);
      return;
    }

    // Check location fields
    if (!values.district || !values.mandal || !values.village) {
      showErrorToast("Please fill all location details");
      setLoading(false);
      return;
    }

    const payload = {
      ...values,
      email: values.email === "" ? "-" : values.email,
      registrationId: `DL-${new Date().getFullYear()}-${Math.floor(
        Math.random() * 1000
      )}`,
    };

    const res = await commonAPICall(EMPLOYEEREG, payload, "post", dispatch);

    if (res?.status === 200 || res?.status === 201) {
      setShowOtpModal(false);
      navigation.goBack();
      resetForm();
    }
    setLoading(false);
  }

  const handlePhoneChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    formik.setFieldValue("mobileNumber", cleaned);
  };

  const handleOtpChange = (text, index) => {
    const currentOtp = formik.values.otp;
    let newOtp = currentOtp.split("");

    while (newOtp.length < 6) newOtp.push("");

    if (text.length > 1) {
      text = text.charAt(text.length - 1);
    }

    if (text && !/^\d+$/.test(text)) {
      return;
    }

    newOtp[index] = text;
    formik.setFieldValue("otp", newOtp.join(""));

    if (text && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    const currentOtp = formik.values.otp;
    const otpArray = currentOtp.split("");

    if (e.nativeEvent.key === "Backspace" && !otpArray[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (text) => {
    const digits = text.replace(/\D/g, "").substring(0, 6);
    formik.setFieldValue("otp", digits);
  };

  const handleSendOtp = async () => {
    setShowErrors(true);

    const errors = await formik.validateForm();

    // Check all required fields including location
    const hasErrors =
      errors.fullName ||
      errors.email ||
      errors.mobileNumber ||
      errors.password ||
      errors.confirmPassword ||
      errors.agreeTerms ||
      errors.district ||
      errors.mandal ||
      errors.village ||
      errors.plotOrHouseNumber ||
      errors.landmark ||
      errors.pincode ||
      errors.latitude ||
      errors.longitude;

    if (!hasErrors && formik.values.agreeTerms) {
      setOtpLoading(true);
      const mobileNumber = formik.values.mobileNumber;

      const url = `${EMPLOYEEREGOTP}${mobileNumber}&userType=${type.toUpperCase()}`;
      const getotp = await commonAPICall(url, {}, "post", dispatch);

      if (getotp?.status === 200 || getotp?.status === 201) {
        setOtpSent(true);
        setOtpTimer(60);
        setShowOtpModal(true);

        const timer = setInterval(() => {
          setOtpTimer((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      setOtpLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowOtpModal(false);
    formik.setFieldValue("otp", "");
    setOtpTimer(0);
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;

    try {
      setOtpLoading(true);
      const mobileNumber = formik.values.mobileNumber;

      const url = `${EMPLOYEEREGOTP}${mobileNumber}&userType=${type.toUpperCase()}`;
      const getotp = await commonAPICall(url, {}, "post", dispatch);

      if (getotp?.status === 200 || getotp?.status === 201) {
        setOtpTimer(60);

        const timer = setInterval(() => {
          setOtpTimer((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      showErrorToast(error?.message || "Failed to resend OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a5f" />

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={{
              uri: "https://labour.dev.nidhi.apcfss.in/files/labourdept/secondslide.jpeg",
            }}
            style={styles.backgroundImage}
          />

          <View style={styles.overlay} />
          <View style={styles.backgroundLayerTop} />
          <View style={styles.backgroundLayerMiddle} />
          <View style={styles.topDecorationOne} />
          <View style={styles.topDecorationTwo} />
          <View style={styles.bottomDecoration} />
          <View style={styles.bottomDecorationTwo} />

          <View style={styles.card}>
            <View style={styles.cardGlow} />

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#1e3a5f" />
              <Text style={styles.backBtnText}>వెనక్కి</Text>
            </TouchableOpacity>

            <View style={styles.logoWrapper}>
              <View style={styles.logoOuterRing}>
                <View style={styles.logoCircle}>
                  <Ionicons
                    name={isWorker ? "person-outline" : "business-outline"}
                    size={34}
                    color="#fff"
                  />
                </View>
              </View>
            </View>

            <Text style={styles.deptName}>కార్మిక శాఖ</Text>
            <Text style={styles.title}>
              {isWorker ? "కార్మికుడి నమోదు" : "యజమాని నమోదు"}
            </Text>
            <Text style={styles.subtitle}>
              ఖాతాను సృష్టించడానికి వివరాలను నమోదు చేయండి
            </Text>

            {/* Full Name */}
            <View style={styles.fieldBlock}>
              <View
                style={[
                  styles.inputWrapper,
                  showErrors &&
                    formik.errors.fullName &&
                    styles.inputWrapperError,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#5f6f94"
                  style={styles.leftIcon}
                />
                <TextInput
                  placeholder={
                    isWorker
                      ? "కార్మికుడి పూర్తి పేరు నమోదు చేయండి"
                      : "యజమాని పూర్తి పేరు నమోదు చేయండి"
                  }
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                  value={formik.values.fullName}
                  onChangeText={(text) =>
                    formik.setFieldValue("fullName", text)
                  }
                />
              </View>
              {showErrors && formik.errors.fullName && (
                <Text style={styles.errorText}>{formik.errors.fullName}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.fieldBlock}>
              <View
                style={[
                  styles.inputWrapper,
                  showErrors && formik.errors.email && styles.inputWrapperError,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#5f6f94"
                  style={styles.leftIcon}
                />
                <TextInput
                  placeholder={
                    isWorker
                      ? "కార్మికుడి ఇమెయిల్ నమోదు చేయండి"
                      : "యజమాని ఇమెయిల్ నమోదు చేయండి"
                  }
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                  value={formik.values.email}
                  onChangeText={formik.handleChange("email")}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              {showErrors && formik.errors.email && (
                <Text style={styles.errorText}>{formik.errors.email}</Text>
              )}
            </View>

            {/* Phone */}
            <View style={styles.fieldBlock}>
              <View
                style={[
                  styles.inputWrapper,
                  showErrors &&
                    formik.errors.mobileNumber &&
                    styles.inputWrapperError,
                ]}
              >
                <Ionicons
                  name="call-outline"
                  size={20}
                  color="#5f6f94"
                  style={styles.leftIcon}
                />
                <TextInput
                  placeholder={
                    isWorker
                      ? "కార్మికుడి మొబైల్ నంబర్ నమోదు చేయండి"
                      : "యజమాని మొబైల్ నంబర్ నమోదు చేయండి"
                  }
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                  value={formik.values.mobileNumber}
                  onChangeText={handlePhoneChange}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </View>
              {showErrors && formik.errors.mobileNumber && (
                <Text style={styles.errorText}>
                  {formik.errors.mobileNumber}
                </Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.fieldBlock}>
              <View
                style={[
                  styles.inputWrapper,
                  showErrors &&
                    formik.errors.password &&
                    styles.inputWrapperError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#5f6f94"
                  style={styles.leftIcon}
                />
                <TextInput
                  placeholder="పాస్వర్డ్ నమోదు చేయండి"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                  value={formik.values.password}
                  onChangeText={formik.handleChange("password")}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={22}
                    color="#1e3a5f"
                  />
                </TouchableOpacity>
              </View>
              {showErrors && formik.errors.password && (
                <Text style={styles.errorText}>{formik.errors.password}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldBlock}>
              <View
                style={[
                  styles.inputWrapper,
                  showErrors &&
                    formik.errors.confirmPassword &&
                    styles.inputWrapperError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#5f6f94"
                  style={styles.leftIcon}
                />
                <TextInput
                  placeholder="పాస్వర్డ్ నిర్ధారించండి"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                  value={formik.values.confirmPassword}
                  onChangeText={formik.handleChange("confirmPassword")}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-outline" : "eye-off-outline"
                    }
                    size={22}
                    color="#1e3a5f"
                  />
                </TouchableOpacity>
              </View>
              {showErrors && formik.errors.confirmPassword && (
                <Text style={styles.errorText}>
                  {formik.errors.confirmPassword}
                </Text>
              )}
            </View>

            {/* ===== LOCATION FIELDS ===== */}

            {/* District */}
            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                District / జిల్లా <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.selectBox,
                  showErrors &&
                    formik.errors.district &&
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
              {showErrors && formik.errors.district && (
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
                  showErrors &&
                    formik.errors.mandal &&
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
              {showErrors && formik.errors.mandal && (
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
                  showErrors &&
                    formik.errors.village &&
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
              {showErrors && formik.errors.village && (
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
                  showErrors &&
                    formik.errors.plotOrHouseNumber &&
                    styles.inputError,
                ]}
                value={formik.values.plotOrHouseNumber}
                onChangeText={formik.handleChange("plotOrHouseNumber")}
                onBlur={formik.handleBlur("plotOrHouseNumber")}
                placeholder="Enter Door No. / ద్వారం నంబర్ నమోదు చేయండి"
                maxLength={20}
              />
              {showErrors && formik.errors.plotOrHouseNumber && (
                <Text style={styles.errorText}>
                  {formik.errors.plotOrHouseNumber}
                </Text>
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
                  showErrors &&
                    formik.errors.landmark &&
                    styles.inputError,
                ]}
                value={formik.values.landmark}
                onChangeText={formik.handleChange("landmark")}
                onBlur={formik.handleBlur("landmark")}
                placeholder="Enter Landmark / ల్యాండ్మార్క్ నమోదు చేయండి"
                maxLength={100}
              />
              {showErrors && formik.errors.landmark && (
                <Text style={styles.errorText}>{formik.errors.landmark}</Text>
              )}
            </View>

            {/* Pincode */}
            <View style={styles.inputBlock}>
              <Text style={styles.label}>
                Pin Code / పిన్ కోడ్ <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  showErrors &&
                    formik.errors.pincode &&
                    styles.inputError,
                ]}
                value={formik.values.pincode}
                onChangeText={formik.handleChange("pincode")}
                onBlur={formik.handleBlur("pincode")}
                placeholder="Enter Pin Code / పిన్ కోడ్ నమోదు చేయండి"
                keyboardType="numeric"
                maxLength={6}
              />
              {showErrors && formik.errors.pincode && (
                <Text style={styles.errorText}>{formik.errors.pincode}</Text>
              )}
            </View>

            {/* Latitude & Longitude - Auto fetched */}
            <View style={styles.rowFields}>
              <View style={[styles.inputBlock, styles.halfField]}>
                <Text style={styles.label}>
                  Latitude / అక్షాంశం <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    showErrors &&
                      formik.errors.latitude &&
                      styles.inputError,
                  ]}
                  value={formik.values.latitude}
                  onChangeText={formik.handleChange("latitude")}
                  onBlur={formik.handleBlur("latitude")}
                  placeholder="Latitude / అక్షాంశం"
                  editable={false}
                />
                {showErrors && formik.errors.latitude && (
                  <Text style={styles.errorText}>{formik.errors.latitude}</Text>
                )}
              </View>

              <View style={[styles.inputBlock, styles.halfField]}>
                <Text style={styles.label}>
                  Longitude / రేఖాంశం <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    showErrors &&
                      formik.errors.longitude &&
                      styles.inputError,
                  ]}
                  value={formik.values.longitude}
                  onChangeText={formik.handleChange("longitude")}
                  onBlur={formik.handleBlur("longitude")}
                  placeholder="Longitude / రేఖాంశం"
                  editable={false}
                />
                {showErrors && formik.errors.longitude && (
                  <Text style={styles.errorText}>{formik.errors.longitude}</Text>
                )}
              </View>
            </View>

            {/* Terms */}
            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={styles.checkboxWrapper}
                onPress={() =>
                  formik.setFieldValue("agreeTerms", !formik.values.agreeTerms)
                }
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.checkbox,
                    formik.values.agreeTerms && styles.checkboxChecked,
                  ]}
                >
                  {formik.values.agreeTerms && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <Text style={styles.termsText}>
                  నేను అంగీకరిస్తున్నాను{" "}
                  <Text
                    style={styles.termsLink}
                    onPress={() => navigation.navigate("TermsAndConditions")}
                  >
                    నిబంధనలు మరియు షరతులు
                  </Text>{" "}
                  <Text>మరియు </Text>
                  <Text
                    style={styles.termsLink}
                    onPress={() => navigation.navigate("PrivacyPolicy")}
                  >
                    గోప్యతా విధానం
                  </Text>
                </Text>
              </TouchableOpacity>
              {showErrors && formik.errors.agreeTerms && (
                <Text style={styles.errorText}>{formik.errors.agreeTerms}</Text>
              )}
            </View>

            {/* Send OTP Button */}
            <TouchableOpacity
              style={[
                styles.sendOtpButton,
                otpLoading && styles.sendOtpButtonDisabled,
              ]}
              onPress={handleSendOtp}
              disabled={otpLoading}
              activeOpacity={0.85}
            >
              {otpLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.sendOtpText}>OTP పంపండి</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* OTP Modal */}
      <Modal
        visible={showOtpModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <Ionicons name="lock-closed" size={24} color="#1e3a5f" />
                <Text style={styles.modalTitle}>Verify OTP / OTP</Text>
              </View>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Enter the 6-digit code sent to {formik.values.mobileNumber} /{" "}
              {formik.values.mobileNumber}కి పంపిన 6-అంకెల కోడ్ నమోదు చేయండి
            </Text>

            <View style={styles.modalOtpContainer}>
              <View style={styles.otpInputsContainer}>
                {Array(6)
                  .fill(0)
                  .map((_, index) => {
                    const otpValue = formik.values.otp[index] || "";
                    return (
                      <TextInput
                        key={index}
                        ref={(ref) => (otpInputs.current[index] = ref)}
                        style={styles.otpInput}
                        value={otpValue}
                        onChangeText={(text) => handleOtpChange(text, index)}
                        onKeyPress={(e) => handleOtpKeyPress(e, index)}
                        onPaste={(e) => handleOtpPaste(e.nativeEvent.text)}
                        keyboardType="number-pad"
                        maxLength={1}
                        autoFocus={index === 0}
                        editable={!loading}
                      />
                    );
                  })}
              </View>

              <View style={styles.resendOtpContainer}>
                <Text style={styles.resendOtpText}>Didn't receive OTP? </Text>
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={otpTimer > 0 || otpLoading}
                >
                  <Text
                    style={[
                      styles.resendOtpLink,
                      otpTimer > 0 && styles.resendOtpDisabled,
                    ]}
                  >
                    Resend {otpTimer > 0 ? `(${otpTimer}s)` : ""}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.modalSubmitButton,
                loading ? styles.submitButtonDisabled : null,
              ]}
              onPress={formik.handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>
                    Verify & Register / నిర్ధారించి నమోదు చేయండి
                  </Text>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#fff"
                    style={{ marginLeft: 8 }}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export const RegisterWorker = ({ navigation }) => {
  return <CommonRegistrationForm navigation={navigation} type="DLC Worker" />;
};

export const RegisterEmployer = ({ navigation }) => {
  return <CommonRegistrationForm navigation={navigation} type="DLC Employer" />;
};

export default LoginCommon;

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },

  screen: {
    flex: 1,
    backgroundColor: "#1e3a5f",
  },

  submitButtonText: {
    color: "white",
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 28,
    position: "relative",
    overflow: "hidden",
  },

  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    opacity: 0.15,
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(30, 58, 95, 0.85)",
  },

  backgroundLayerTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "42%",
    backgroundColor: "#1e3a5f",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },

  backgroundLayerMiddle: {
    position: "absolute",
    top: "24%",
    left: -20,
    right: -20,
    height: 180,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 50,
    transform: [{ rotate: "-6deg" }],
  },

  topDecorationOne: {
    position: "absolute",
    top: -35,
    right: -25,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  topDecorationTwo: {
    position: "absolute",
    top: 95,
    left: -48,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(173,216,255,0.16)",
  },

  bottomDecoration: {
    position: "absolute",
    bottom: 55,
    right: -45,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  bottomDecorationTwo: {
    position: "absolute",
    bottom: 10,
    left: -35,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(173,216,255,0.13)",
  },

  heroImageWrapper: {
    height: 160,
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    position: "relative",
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  heroImageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(30, 58, 95, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },

  heroImageText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 5,
  },

  heroImageSubText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    opacity: 0.9,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 24,
    shadowColor: "#0a1a2e",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    overflow: "hidden",
  },

  cardGlow: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(30, 58, 95, 0.10)",
  },

  logoWrapper: {
    alignItems: "center",
    marginBottom: 10,
  },

  logoOuterRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(30, 58, 95, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },

  logoCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#1e3a5f",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1e3a5f",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 6,
  },

  deptName: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    color: "#1e3a5f",
    marginBottom: 4,
    letterSpacing: 1,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    textAlign: "center",
    color: "#111827",
    marginBottom: 6,
    letterSpacing: 0.3,
  },

  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },

  fieldBlock: {
    marginBottom: 16,
  },

  inputWrapper: {
    minHeight: 56,
    backgroundColor: "#f8fbff",
    borderRadius: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#d7e3ff",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#1e3a5f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  captchaInputWrapper: {
    flex: 1.2,
    minHeight: 56,
    backgroundColor: "#f8fbff",
    borderRadius: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#d7e3ff",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#1e3a5f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  inputWrapperError: {
    borderColor: "#ef4444",
    backgroundColor: "#fff6f6",
  },

  leftIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    color: "#111827",
    fontSize: 15,
    paddingVertical: 14,
  },

  eyeButton: {
    paddingLeft: 10,
    paddingVertical: 6,
  },

  captchaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  captchaBox: {
    flex: 1,
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d7e3ff",
    backgroundColor: "#f8fbff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    shadowColor: "#1e3a5f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },

  captchaImage: {
    width: "100%",
    height: 42,
  },

  captchaPlaceholderText: {
    color: "#6b7280",
    fontWeight: "600",
    fontSize: 13,
  },

  refreshBtn: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#eef4ff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d7e3ff",
    shadowColor: "#1e3a5f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 9,
    elevation: 2,
  },

  loginButton: {
    width: "100%",
    height: 58,
    backgroundColor: "#1e3a5f",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    flexDirection: "row",
    shadowColor: "#0f2a40",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 7,
    borderWidth: 1,
    borderColor: "#2c4b75",
  },

  loginButtonDisabled: {
    opacity: 0.8,
  },

  loginText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  errorText: {
    color: "#ef4444",
    marginTop: 6,
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "600",
  },

  bottomSpacing: {
    height: 30,
  },

  optionCard: {
    minHeight: 74,
    borderRadius: 18,
    backgroundColor: "#f8fbff",
    borderWidth: 1,
    borderColor: "#d7e3ff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
  },

  optionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eaf1ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  optionTextWrap: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 3,
  },

  optionSubTitle: {
    fontSize: 12,
    color: "#64748b",
  },

  actionButtonPrimary: {
    height: 56,
    backgroundColor: "#1e3a5f",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 10,
  },

  actionButtonPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  actionButtonSecondary: {
    height: 56,
    backgroundColor: "#eef4ff",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#d7e3ff",
    marginTop: 4,
  },

  actionButtonSecondaryText: {
    color: "#1e3a5f",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 14,
  },

  backBtnText: {
    color: "#1e3a5f",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },
  eshramButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 1,
  },

  eshramText: {
    fontSize: 16,
    fontWeight: "700",
    color: "blue",
    textAlign: "center",
    textDecorationLine: "underline",
  },

  termsContainer: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },

  checkboxWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#1e3a5f",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  checkboxChecked: {
    backgroundColor: "#1e3a5f",
    borderColor: "#1e3a5f",
  },

  termsText: {
    flex: 1,
    fontSize: 13,
    color: "#2d3a5e",
    lineHeight: 18,
  },

  termsLink: {
    color: "#1e3a5f",
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  sendOtpButton: {
    backgroundColor: "#2ecc71",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 10,
  },

  sendOtpText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  otpContainer: {
    marginBottom: 20,
    marginTop: 10,
  },

  otpLabel: {
    fontSize: 14,
    color: "#2d3a5e",
    marginBottom: 10,
    fontWeight: "500",
  },

  otpInputsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#1e3a5f",
    backgroundColor: "#f8fafc",
  },

  otpInputError: {
    borderColor: "#ef4444",
    borderWidth: 2,
  },

  resendOtpContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 5,
  },

  resendOtpText: {
    fontSize: 13,
    color: "#6b7280",
  },

  resendOtpLink: {
    fontSize: 13,
    color: "#1e3a5f",
    fontWeight: "600",
  },

  resendOtpDisabled: {
    color: "#9ca3af",
  },

  loginButtonHidden: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e3a5f",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 24,
    textAlign: "center",
  },
  modalOtpContainer: {
    marginBottom: 24,
  },
  modalSubmitButton: {
    backgroundColor: "#1e3a5f",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  // Make sure these OTP input styles are defined
  otpInputsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    backgroundColor: "#f8fafc",
  },
  otpInputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  resendOtpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  resendOtpText: {
    fontSize: 14,
    color: "#64748b",
  },
  resendOtpLink: {
    fontSize: 14,
    color: "#1e3a5f",
    fontWeight: "600",
  },
  resendOtpDisabled: {
    color: "#94a3b8",
  },
  inputBlock: {
    marginBottom: 16,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  picker: {
    color: "#000", // Force black text in all modes
  },

});