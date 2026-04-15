import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { UserType } from "./types/user";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    const patientPaths = [
      "/dashboard", "/settings", "/appointment", "/consult", "/medicine",
      "/patient", "/pharmacy", "/pill", "/reports", "/what-you-taking",
      "/doctors", "/hospital", "/hospitals", "/chatbot", "/emergency",
      "/notification", "/notifications", "/new", "/socket-test"
    ];

    const doctorPaths = [
      "/doctor_appointment", "/doctor_dashboard"
    ];

    const hospitalPaths = [
      "/appointments", "/attendance", "/hospital-notification",
      "/hospital-schedule", "/hospital_dashboard", "/profile", "/staff"
    ];

    const sharedSchedulePath = "/schedule";

    const matchPath = (p: string) => path === p || path.startsWith(`${p}/`);

    const isPatientPath = patientPaths.some(matchPath);
    const isDoctorPath = doctorPaths.some(matchPath);
    const isHospitalPath = hospitalPaths.some(matchPath);
    const isSchedulePath = matchPath(sharedSchedulePath);

    // If no token, redirect to appropriate signin or home
    if (!token) {
      if (isDoctorPath) {
        return NextResponse.redirect(new URL("/doctor_signin", req.url));
      }
      if (isHospitalPath) {
        return NextResponse.redirect(new URL("/signin-hospital", req.url));
      }
      // Ambiguous path goes to main sign in, but could be specific if they want
      if (isPatientPath || isSchedulePath) {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
      return NextResponse.next();
    }

    // Role-based access control
    if (isPatientPath && token.userType !== UserType.PATIENT) {
      if (token.userType === UserType.DOCTOR) return NextResponse.redirect(new URL("/doctor_dashboard", req.url));
      if (token.userType === UserType.HOSPITAL) return NextResponse.redirect(new URL("/hospital_dashboard", req.url));
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (isDoctorPath && token.userType !== UserType.DOCTOR) {
      if (token.userType === UserType.PATIENT) return NextResponse.redirect(new URL("/dashboard", req.url));
      if (token.userType === UserType.HOSPITAL) return NextResponse.redirect(new URL("/hospital_dashboard", req.url));
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (isHospitalPath && token.userType !== UserType.HOSPITAL) {
      if (token.userType === UserType.PATIENT) return NextResponse.redirect(new URL("/dashboard", req.url));
      if (token.userType === UserType.DOCTOR) return NextResponse.redirect(new URL("/doctor_dashboard", req.url));
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (isSchedulePath && token.userType !== UserType.DOCTOR && token.userType !== UserType.HOSPITAL) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Return true to allow the middleware function to process paths
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/appointment/:path*",
    "/consult/:path*",
    "/medicine/:path*",
    "/patient/:path*",
    "/pharmacy/:path*",
    "/pill/:path*",
    "/reports/:path*",
    "/what-you-taking/:path*",
    "/doctors/:path*",
    "/hospital/:path*",
    "/hospital",
    "/hospitals/:path*",
    "/chatbot/:path*",
    "/emergency/:path*",
    "/notification/:path*",
    "/notifications/:path*",
    "/new/:path*",
    "/doctor_appointment/:path*",
    "/doctor_dashboard/:path*",
    "/appointments/:path*",
    "/attendance/:path*",
    "/hospital-notification/:path*",
    "/hospital-schedule/:path*",
    "/hospital_dashboard/:path*",
    "/profile/:path*",
    "/staff/:path*",
    "/schedule/:path*"
  ],
};