import { getUserById } from "@/data/user.data";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: SearchParamProps) {
  const authorized = request.headers.get("x-internal-secret") === process.env.INTERNAL_API_SECRET;
  console.log("cache miss api/startup/user/:id");
  if (!authorized) {
    return NextResponse.json({ errorMessage: "Missing a significant header" }, { status: 401 }); // unauthorized
  }
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ errorMessage: "id not present" }, { status: 400 }); // bad request
  }
  try {
    const user = await getUserById(id);
    return NextResponse.json({ data: user });
  } catch (error) {
    return NextResponse.json({ errorMessage: (error as Error).message }, { status: 500 });
  }
}

export type StartupApiUserResponse = {
  data: TUser;
};

export type StartupApiUserErrorResponse = {
  errorMessage: string;
};
