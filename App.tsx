import { StatusBar } from "expo-status-bar";
import {
	StyleSheet,
	Platform,
	Dimensions,
	TouchableOpacity,
	View,
	Text,
} from "react-native";
import Animated, {
	Extrapolate,
	interpolate,
	runOnJS,
	useAnimatedGestureHandler,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import {
	GestureHandlerRootView,
	PanGestureHandler,
	PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import { useCallback, useState } from "react";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const BACKGROUND_COLOR = "#1e1e23";

export default function App() {
	const [menuOpened, setMenuOpened] = useState<Boolean>(false);

	const translateX = useSharedValue<number>(0);

	const panGestureEvent = useAnimatedGestureHandler<
		PanGestureHandlerGestureEvent,
		{ x: number }
	>({
		onStart: (_, context) => {
			context.x = translateX.value;
		},
		onActive: (e, context) => {
			if (!menuOpened && e.translationX <= 0) return;

			translateX.value = e.translationX + context.x;
		},
		onEnd: () => {
			if (translateX.value <= SCREEN_WIDTH / 4) {
				runOnJS(setMenuOpened)(false);
				translateX.value = withTiming(0);
				return;
			}

			runOnJS(setMenuOpened)(true);
			translateX.value = withSpring(SCREEN_WIDTH / 2);
		},
	});

	const rStyle = useAnimatedStyle(() => {
		const rotateOnY = interpolate(
			translateX.value,
			[0, SCREEN_WIDTH / 2],
			[0, -3],
			Extrapolate.CLAMP
		);

		const borderRadius = interpolate(
			translateX.value,
			[0, SCREEN_WIDTH / 2],
			[0, 20],
			Extrapolate.CLAMP
		);

		return {
			borderRadius,
			transform: [
				{ perspective: 80 },
				{ translateX: Math.max(translateX.value, 0) },
				{
					rotateY: `${rotateOnY}deg`,
				},
			],
		};
	}, []);

	const onPressMenuButton = useCallback(() => {
		setMenuOpened((prev) => !prev);

		if (translateX.value > 0) {
			translateX.value = withTiming(0);
			return;
		}

		translateX.value = withSpring(SCREEN_WIDTH / 2);
	}, []);

	const navigation = [
		{ key: 1, title: "Home" },
		{ key: 2, title: "Our Team" },
		{ key: 3, title: "Pricing" },
		{ key: 4, title: "Privacy&Terms" },
	];

	return (
		<GestureHandlerRootView style={styles.container}>
			<StatusBar style="inverted" />
			<PanGestureHandler onGestureEvent={panGestureEvent}>
				<Animated.View style={[styles.mainWindow, rStyle]}>
					<TouchableOpacity onPress={onPressMenuButton}>
						<Feather
							name={menuOpened ? "x" : "menu"}
							size={32}
							color={BACKGROUND_COLOR}
							style={{ margin: 25 }}
						/>
					</TouchableOpacity>
				</Animated.View>
			</PanGestureHandler>
			<View style={styles.nav}>
				{navigation.map((item) => (
					<TouchableOpacity
						key={item.key}
						onPress={() => {
							translateX.value = withTiming(0);
							setMenuOpened(false);
						}}
					>
						<Text style={styles.navItem}>{item.title}</Text>
					</TouchableOpacity>
				))}
			</View>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: BACKGROUND_COLOR,
		paddingTop: Platform.OS === "android" ? 47 : 0,
		justifyContent: "center",
	},
	mainWindow: {
		flex: 1,
		backgroundColor: "#fafafa",
		zIndex: 99,
	},
	nav: {
		position: "absolute",
		left: 35,
		height: 160,
		justifyContent: "space-between",
	},
	navItem: {
		fontSize: 23,
		fontWeight: "bold",
		color: "#fafafa",
	},
});
