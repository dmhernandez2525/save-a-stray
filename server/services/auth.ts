import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { UserDocument } from '../models/User';
import keys from '../../config/keys';
import validateRegisterInput from '../validation/register';
import validateLoginInput from '../validation/login';
import { RegisterInput, LoginInput, UserAuthPayload } from '../../shared/types';

interface FacebookProfile {
  id: string;
  displayName: string;
}

interface TokenData {
  token: string;
}

interface IdTokenData {
  _id: string;
}

export const register = async (data: RegisterInput): Promise<UserAuthPayload> => {
  try {
    const { message, isValid } = validateRegisterInput(data);

    if (!isValid) {
      throw new Error(message);
    }

    const { name, email, password, userRole, shelterId } = data;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new Error("This email is already used");
    }

    const existingName = await User.findOne({ name });
    if (existingName) {
      throw new Error("This name is taken");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      userRole,
      shelterId
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, keys.secretOrKey);

    return {
      token,
      loggedIn: true,
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      userRole: user.userRole
    };
  } catch (err) {
    throw err;
  }
};

export const facebookRegister = async (data: FacebookProfile): Promise<UserAuthPayload> => {
  try {
    const { id, displayName } = data;
    const email = id;
    const name = displayName;
    const userRole = "endUser";

    const existingEmail = await User.findOne({ email: id });

    if (existingEmail) {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("This user does not exist");
      }

      const correctPassword = bcrypt.compareSync(email, user.password);
      if (!correctPassword) {
        throw new Error("Invalid credentials");
      }

      const token = jwt.sign({ id: user._id }, keys.secretOrKey);

      return {
        token,
        loggedIn: true,
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        userRole: user.userRole
      };
    }

    const hashedPassword = await bcrypt.hash(email, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      userRole
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, keys.secretOrKey);

    return {
      token,
      loggedIn: true,
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      userRole: user.userRole
    };
  } catch (err) {
    throw err;
  }
};

export const login = async (data: LoginInput): Promise<UserAuthPayload> => {
  try {
    const { message, isValid } = validateLoginInput(data);

    if (!isValid) {
      throw new Error(message);
    }

    const { email, password } = data;
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("This user does not exist");
    }

    const correctPassword = bcrypt.compareSync(password, user.password);
    if (!correctPassword) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign({ id: user._id }, keys.secretOrKey);

    return {
      token,
      loggedIn: true,
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      userRole: user.userRole
    };
  } catch (err) {
    throw err;
  }
};

export const logout = async (data: IdTokenData): Promise<UserAuthPayload> => {
  try {
    const { _id } = data;
    const user = await User.findById(_id);

    if (!user) {
      throw new Error("This user does not exist");
    }

    return {
      token: "",
      loggedIn: false,
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      userRole: user.userRole
    };
  } catch (err) {
    throw err;
  }
};

export const verifyUser = async (data: TokenData): Promise<{ loggedIn: boolean; _id: string | null }> => {
  try {
    const { token } = data;
    const decoded = jwt.verify(token, keys.secretOrKey) as { id: string };
    const { id } = decoded;

    const user = await User.findById(id);

    if (user) {
      return { loggedIn: true, _id: user._id.toString() };
    }
    return { loggedIn: false, _id: null };
  } catch (err) {
    return { loggedIn: false, _id: null };
  }
};

export const userId = async (data: TokenData): Promise<Partial<UserAuthPayload>> => {
  try {
    const { token } = data;
    const decoded = jwt.verify(token, keys.secretOrKey) as { id: string };
    const { id } = decoded;

    const user = await User.findById(id);

    if (user) {
      return {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        userRole: user.userRole
      };
    }
    return { loggedIn: false };
  } catch (err) {
    return { loggedIn: false };
  }
};

export default {
  register,
  login,
  logout,
  verifyUser,
  facebookRegister,
  userId
};
