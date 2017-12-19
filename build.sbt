name := "betting-odds-analyzer"

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.12.4"

libraryDependencies ++= Seq(
  jdbc,
  evolutions,
  cache,
  guice,
  ws,
  specs2 % Test,
  "mysql" % "mysql-connector-java" % "6.0.6",
  "com.typesafe.play" %% "anorm" % "2.5.3"
)

//resolvers += "scalaz-bintray" at "http://dl.bintray.com/scalaz/releases"
