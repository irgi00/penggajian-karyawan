import { NextResponse } from "next/server";

export function success(data: any, message: string = "Success", status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function error(message: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}
