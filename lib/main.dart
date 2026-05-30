import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:uzivaj/providers/app_provider.dart';
import 'package:uzivaj/providers/signup_provider.dart';
import 'package:uzivaj/providers/login_provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:uzivaj/firebaseOptions.dart';
import 'package:uzivaj/providers/authProvider.dart';
import 'package:uzivaj/screens/login.dart';
import 'package:uzivaj/screens/signup.dart';
import 'package:uzivaj/screens/splash.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppProvider()),
        ChangeNotifierProvider(create: (_) => SignupProvider()),
        ChangeNotifierProvider(create: (_) => LoginProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Uzivaj',
      theme: ThemeData(
        fontFamily: 'Poppins',
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
      ),
      home: const SplashScreen(),
    );
  }
}
