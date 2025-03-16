const bcrypt = require("bcrypt");
const { User } = require('../models/association');
const jwt = require('jsonwebtoken')


exports.createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("Plain Password:", password);
        console.log("Hashed Password:", hashedPassword);

        const user = await User.create({ 
            username, 
            email, 
            password: hashedPassword 
        });

        const token = jwt.sign({ userId: user.id }, "MY_SECRET_KEY", { expiresIn: "1h" });

        res.status(201).json({ message: "User created successfully", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


  exports.getUser = async(req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      console.log(user)

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  exports.getAllUsers = async(req, res) => {
    try {
      const users = await User.findAll();

      if (!users) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  exports.verifyUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Received Email:", email);
        console.log("Received Password:", password);

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        console.log("Stored Password (hashed):", user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password Match Result:", isMatch);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user.id }, "MY_SECRET_KEY", { expiresIn: "1h" });

        res.status(200).json({ message: "Sign-in successful", token });
    } catch (error) {
        console.error("Error in verifyUser:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateUser = async(req, res) => {
    try {
      const { username, email, password } = req.body;
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }
      await user.update({ username, email, password: user.password });
    
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}

exports.deleteUser = async(req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      await user.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}