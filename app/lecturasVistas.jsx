import { View, Text } from 'react-native'
import React from 'react'
import Lecturas from '../components/exploraComponents/lecturasVistas'

export default function LecturasVistas() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Lecturas />
    </View>
  )
}