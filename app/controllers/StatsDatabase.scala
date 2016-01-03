package controllers

import anorm._
import anorm.SqlParser._
import play.api.db.DB
import play.api.mvc._
import play.api.Play.current
import play.api.libs.json._


class StatsDatabase extends Controller {

  def getOrganizations = Action {
    DB.withConnection { implicit c =>
      val parser = int("id") ~ str("name") ~ str("description") map flatten
      SQL("SELECT * FROM organizations").as(parser.*)
      val sqlResult = SQL("SELECT * FROM organizations").as(parser.*)
      val jsonObjects = sqlResult.map { org =>
        Json.obj(
          "id" -> org._1,
          "name" -> org._2,
          "description" -> org._3
        )
      }
      Ok(Json.toJson(jsonObjects))
    }
  }

  def getEvents(orgId: Int) = Action {
    DB.withConnection { implicit c =>
      val parser = int("id") ~ str("name") ~ date("event_date") ~ str("location") ~ int("org_id") map flatten
      val sqlResult = SQL(s"SELECT * FROM events WHERE org_id = $orgId").as(parser.*)
      val jsonObjects = sqlResult.map { event =>
        Json.obj(
          "id" -> event._1,
          "name" -> event._2,
          "event_date" -> event._3,
          "location" -> event._4,
          "org_id" -> event._5
        )
      }
      Ok(Json.toJson(jsonObjects))
    }
  }

  def getFights(eventId: Int) = Action {
    DB.withConnection { implicit c =>
      val parser =
        int("id") ~
        int("event_id") ~
        int("athlete1_id") ~
        int("athlete2_id") ~
        str("athlete1_result") ~
        str("athlete2_result") ~
        int("end_round") ~
        str("end_round_time") ~
        str("method") ~
        str("referee") map flatten
      val sqlResult = SQL(s"SELECT * FROM fights WHERE event_id = $eventId").as(parser.*)
      val jsonObjects = sqlResult.map { fight =>
        Json.obj(
          "id" -> fight._1,
          "event_id" -> fight._2,
          "athlete1_id" -> fight._3,
          "athlete2_id" -> fight._4,
          "athlete1_result" -> fight._5,
          "athlete2_result" -> fight._6,
          "end_round" -> fight._7,
          "end_round_time" -> fight._8,
          "method" -> fight._9,
          "referee" -> fight._10
        )
      }
      Ok(Json.toJson(jsonObjects))
    }
  }

  def getAthleteNames(fightId: Int) = Action {
    DB.withConnection { implicit c =>
      val parser = str(1) ~ str(2) map flatten
      val sqlResult = SQL(
        s"""
          SELECT
            a1.fullname athlete1,
            a2.fullname athlete2
          FROM fights
          INNER JOIN athletes a1 ON fights.athlete1_id = a1.id
          INNER JOIN athletes a2 ON fights.athlete2_id = a2.id
          WHERE fights.id = $fightId
        """
      ).as(parser.*)
      val jsonObjects = sqlResult.map { fight =>
        Json.obj(
          "athlete1" -> fight._1,
          "athlete2" -> fight._2
        )
      }
      Ok(jsonObjects(0))
    }
  }

  def getAthlete(id: Int) = Action {
    DB.withConnection { implicit c =>
      val parser =
        int("id") ~
        str("fullname") ~
        get[Option[String]]("nickname") ~
        date("birth_date") ~
        get[Option[String]]("birth_locality") ~
        str("nationality") ~
        double("height_cm") ~
        double("weight_kg") ~
        str("weight_class") ~
        int("wins") ~
        int("wins_ko_tko") ~
        int("wins_sub") ~
        int("wins_dec") ~
        int("losses") ~
        int("losses_ko_tko") ~
        int("losses_sub") ~
        int("losses_dec") map flatten
      val sqlResult = SQL(s"SELECT * FROM athletes WHERE id = $id").as(parser.*)
      val jsonObjects = sqlResult.map { athlete =>
        Json.obj(
          "id" -> athlete._1,
          "fullname" -> athlete._2,
          "nickname" -> athlete._3,
          "birth_date" -> athlete._4,
          "birth_locality" -> athlete._5,
          "nationality" -> athlete._6,
          "height_cm" -> athlete._7,
          "weight_kg" -> athlete._8,
          "weight_class" -> athlete._9,
          "wins" -> athlete._10,
          "wins_ko_tko" -> athlete._11,
          "wins_sub" -> athlete._12,
          "wins_dec" -> athlete._13,
          "losses" -> athlete._14,
          "losses_ko_tko" -> athlete._15,
          "losses_sub" -> athlete._16,
          "losses_dec" -> athlete._17
        )
      }
      Ok(jsonObjects(0))
    }
  }

}
